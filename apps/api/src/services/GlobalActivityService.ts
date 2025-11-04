import { prisma } from '@rightfit/database';

export interface GlobalActivityEntry {
  id: string;
  timestamp: Date;
  activity_type: 'PROPERTY' | 'JOB' | 'WORKER';
  event_type: string;
  description: string;
  metadata?: any;
  // Entity references
  property_id?: string;
  property_name?: string;
  job_id?: string;
  worker_id?: string;
  worker_name?: string;
}

export class GlobalActivityService {
  /**
   * Get combined activity feed from all history sources
   */
  async getGlobalActivity(
    tenantId: string,
    limit: number = 50
  ): Promise<GlobalActivityEntry[]> {
    // Query all three history tables in parallel (without includes)
    const [propertyHistory, jobHistory, workerHistory] = await Promise.all([
      // Property history
      prisma.propertyHistory.findMany({
        take: limit,
        orderBy: { changed_at: 'desc' },
      }),

      // Cleaning job history
      prisma.cleaningJobHistory.findMany({
        take: limit,
        orderBy: { changed_at: 'desc' },
        include: {
          cleaning_job: {
            select: {
              id: true,
              property_id: true,
              assigned_worker_id: true,
            },
          },
        },
      }),

      // Worker history
      prisma.workerHistory.findMany({
        take: limit,
        orderBy: { changed_at: 'desc' },
        include: {
          worker: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              service_provider_id: true,
            },
          },
        },
      }),
    ]);

    // Extract unique IDs to fetch related data
    const propertyIds = new Set<string>();
    const workerIds = new Set<string>();
    const serviceProviderIds = new Set<string>();

    // Collect property IDs from property history
    propertyHistory.forEach(entry => propertyIds.add(entry.property_id));

    // Collect IDs from job history
    jobHistory.forEach(entry => {
      if (entry.cleaning_job?.property_id) {
        propertyIds.add(entry.cleaning_job.property_id);
      }
      if (entry.cleaning_job?.assigned_worker_id) {
        workerIds.add(entry.cleaning_job.assigned_worker_id);
      }
    });

    // Collect service provider IDs from worker history
    workerHistory.forEach(entry => {
      if (entry.worker?.service_provider_id) {
        serviceProviderIds.add(entry.worker.service_provider_id);
      }
    });

    // Fetch all related data in parallel
    const [properties, workers, serviceProviders] = await Promise.all([
      // Fetch properties with tenant filtering through customer → service_provider relation
      prisma.customerProperty.findMany({
        where: {
          id: { in: Array.from(propertyIds) },
          customer: {
            is: {
              service_provider: {
                is: {
                  tenant_id: tenantId,
                },
              },
            },
          },
        },
        select: {
          id: true,
          property_name: true,
          customer: {
            select: {
              service_provider: {
                select: {
                  tenant_id: true,
                },
              },
            },
          },
        },
      }),

      // Fetch workers
      prisma.worker.findMany({
        where: {
          id: { in: Array.from(workerIds) },
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      }),

      // Fetch service providers to check tenant
      prisma.serviceProvider.findMany({
        where: {
          id: { in: Array.from(serviceProviderIds) },
        },
        select: {
          id: true,
          tenant_id: true,
        },
      }),
    ]);

    // Create lookup maps
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    const workerMap = new Map(workers.map(w => [w.id, w]));
    const serviceProviderMap = new Map(serviceProviders.map(sp => [sp.id, sp]));

    // Normalize property history entries
    const normalizedPropertyHistory: GlobalActivityEntry[] = propertyHistory
      .filter(entry => {
        const property = propertyMap.get(entry.property_id);
        return property && property.customer.service_provider.tenant_id === tenantId;
      })
      .map(entry => {
        const property = propertyMap.get(entry.property_id)!;
        return {
          id: `property-${entry.id}`,
          timestamp: entry.changed_at,
          activity_type: 'PROPERTY' as const,
          event_type: entry.change_type,
          description: entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase(),
          metadata: entry.metadata,
          property_id: entry.property_id,
          property_name: property.property_name,
        };
      });

    // Normalize job history entries
    const normalizedJobHistory: GlobalActivityEntry[] = jobHistory
      .filter(entry => {
        if (!entry.cleaning_job?.property_id) return false;
        const property = propertyMap.get(entry.cleaning_job.property_id);
        return property && property.customer.service_provider.tenant_id === tenantId;
      })
      .map(entry => {
        const property = propertyMap.get(entry.cleaning_job!.property_id);
        const worker = entry.cleaning_job?.assigned_worker_id
          ? workerMap.get(entry.cleaning_job.assigned_worker_id)
          : undefined;
        const workerName = worker
          ? `${worker.first_name} ${worker.last_name}`
          : undefined;

        return {
          id: `job-${entry.id}`,
          timestamp: entry.changed_at,
          activity_type: 'JOB' as const,
          event_type: entry.change_type,
          description: entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase(),
          metadata: entry.metadata,
          job_id: entry.cleaning_job_id,
          property_id: entry.cleaning_job?.property_id,
          property_name: property?.property_name,
          worker_id: entry.cleaning_job?.assigned_worker_id,
          worker_name: workerName,
        };
      });

    // Normalize worker history entries
    const normalizedWorkerHistory: GlobalActivityEntry[] = workerHistory
      .filter(entry => {
        if (!entry.worker?.service_provider_id) return false;
        const serviceProvider = serviceProviderMap.get(entry.worker.service_provider_id);
        return serviceProvider && serviceProvider.tenant_id === tenantId;
      })
      .map(entry => {
        const workerName = `${entry.worker.first_name} ${entry.worker.last_name}`;

        return {
          id: `worker-${entry.id}`,
          timestamp: entry.changed_at,
          activity_type: 'WORKER' as const,
          event_type: entry.change_type,
          description: entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase(),
          metadata: entry.metadata,
          worker_id: entry.worker_id,
          worker_name: workerName,
          // Include property/job info if present in metadata
          property_name: entry.metadata?.property_name,
          job_id: entry.metadata?.job_id,
        };
      });

    // Combine all entries
    const allEntries = [
      ...normalizedPropertyHistory,
      ...normalizedJobHistory,
      ...normalizedWorkerHistory,
    ];

    // Sort by timestamp descending and limit
    const sortedEntries = allEntries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return sortedEntries;
  }

  /**
   * Get activity feed with filters
   */
  async getGlobalActivityFiltered(
    tenantId: string,
    options: {
      activity_type?: 'PROPERTY' | 'JOB' | 'WORKER';
      property_id?: string;
      worker_id?: string;
      from_date?: Date;
      to_date?: Date;
      limit?: number;
    }
  ): Promise<GlobalActivityEntry[]> {
    const { activity_type, property_id, worker_id, from_date, to_date, limit = 50 } = options;

    // Build where clauses for each history type
    const dateFilter = {
      changed_at: {
        ...(from_date && { gte: from_date }),
        ...(to_date && { lte: to_date }),
      },
    };

    // Only query the requested activity types
    const shouldQueryProperty = !activity_type || activity_type === 'PROPERTY';
    const shouldQueryJob = !activity_type || activity_type === 'JOB';
    const shouldQueryWorker = !activity_type || activity_type === 'WORKER';

    const queries: Promise<any>[] = [];

    // Property history (no includes - fetch separately)
    if (shouldQueryProperty) {
      queries.push(
        prisma.propertyHistory.findMany({
          where: {
            ...dateFilter,
            ...(property_id && { property_id }),
          },
          take: limit,
          orderBy: { changed_at: 'desc' },
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    // Job history (use correct relation name)
    if (shouldQueryJob) {
      // If filtering by property_id, we need to get cleaning_job_ids first
      let jobHistoryWhere: any = { ...dateFilter };

      if (property_id) {
        // Find cleaning job IDs for this property
        const jobsForProperty = await prisma.cleaningJob.findMany({
          where: { property_id },
          select: { id: true },
        });
        const jobIds = jobsForProperty.map(j => j.id);
        jobHistoryWhere.cleaning_job_id = { in: jobIds };
      }

      queries.push(
        prisma.cleaningJobHistory.findMany({
          where: jobHistoryWhere,
          take: limit,
          orderBy: { changed_at: 'desc' },
          include: {
            cleaning_job: {
              select: {
                id: true,
                property_id: true,
                assigned_worker_id: true,
              },
            },
          },
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    // Worker history
    if (shouldQueryWorker) {
      queries.push(
        prisma.workerHistory.findMany({
          where: {
            ...dateFilter,
            ...(worker_id && { worker_id }),
          },
          take: limit,
          orderBy: { changed_at: 'desc' },
          include: {
            worker: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                service_provider_id: true,
              },
            },
          },
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    const [propertyHistory, jobHistory, workerHistory] = await Promise.all(queries);

    // Extract unique IDs to fetch related data
    const propertyIds = new Set<string>();
    const workerIds = new Set<string>();
    const serviceProviderIds = new Set<string>();

    // Collect property IDs
    propertyHistory.forEach((entry: any) => propertyIds.add(entry.property_id));
    jobHistory.forEach((entry: any) => {
      if (entry.cleaning_job?.property_id) {
        propertyIds.add(entry.cleaning_job.property_id);
      }
      if (entry.cleaning_job?.assigned_worker_id) {
        workerIds.add(entry.cleaning_job.assigned_worker_id);
      }
    });

    // Collect service provider IDs
    workerHistory.forEach((entry: any) => {
      if (entry.worker?.service_provider_id) {
        serviceProviderIds.add(entry.worker.service_provider_id);
      }
    });

    // Fetch all related data in parallel
    const [properties, workers, serviceProviders] = await Promise.all([
      prisma.customerProperty.findMany({
        where: {
          id: { in: Array.from(propertyIds) },
          customer: {
            is: {
              service_provider: {
                is: {
                  tenant_id: tenantId,
                },
              },
            },
          },
        },
        select: {
          id: true,
          property_name: true,
          customer: {
            select: {
              service_provider: {
                select: {
                  tenant_id: true,
                },
              },
            },
          },
        },
      }),
      prisma.worker.findMany({
        where: {
          id: { in: Array.from(workerIds) },
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      }),
      prisma.serviceProvider.findMany({
        where: {
          id: { in: Array.from(serviceProviderIds) },
        },
        select: {
          id: true,
          tenant_id: true,
        },
      }),
    ]);

    // Create lookup maps
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    const workerMap = new Map(workers.map(w => [w.id, w]));
    const serviceProviderMap = new Map(serviceProviders.map(sp => [sp.id, sp]));

    // Normalize property history entries
    const normalizedPropertyHistory: GlobalActivityEntry[] = propertyHistory
      .filter((entry: any) => {
        const property = propertyMap.get(entry.property_id);
        return property && property.customer.service_provider.tenant_id === tenantId;
      })
      .map((entry: any) => {
        const property = propertyMap.get(entry.property_id)!;
        return {
          id: `property-${entry.id}`,
          timestamp: entry.changed_at,
          activity_type: 'PROPERTY' as const,
          event_type: entry.change_type,
          description: entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase(),
          metadata: entry.metadata,
          property_id: entry.property_id,
          property_name: property.property_name,
        };
      });

    // Normalize job history entries
    const normalizedJobHistory: GlobalActivityEntry[] = jobHistory
      .filter((entry: any) => {
        if (!entry.cleaning_job?.property_id) return false;
        const property = propertyMap.get(entry.cleaning_job.property_id);
        return property && property.customer.service_provider.tenant_id === tenantId;
      })
      .map((entry: any) => {
        const property = propertyMap.get(entry.cleaning_job.property_id);
        const worker = entry.cleaning_job?.assigned_worker_id
          ? workerMap.get(entry.cleaning_job.assigned_worker_id)
          : undefined;
        const workerName = worker
          ? `${worker.first_name} ${worker.last_name}`
          : undefined;

        return {
          id: `job-${entry.id}`,
          timestamp: entry.changed_at,
          activity_type: 'JOB' as const,
          event_type: entry.change_type,
          description: entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase(),
          metadata: entry.metadata,
          job_id: entry.cleaning_job_id,
          property_id: entry.cleaning_job?.property_id,
          property_name: property?.property_name,
          worker_id: entry.cleaning_job?.assigned_worker_id,
          worker_name: workerName,
        };
      });

    // Normalize worker history entries
    const normalizedWorkerHistory: GlobalActivityEntry[] = workerHistory
      .filter((entry: any) => {
        if (!entry.worker?.service_provider_id) return false;
        const serviceProvider = serviceProviderMap.get(entry.worker.service_provider_id);
        return serviceProvider && serviceProvider.tenant_id === tenantId;
      })
      .map((entry: any) => {
        const workerName = `${entry.worker.first_name} ${entry.worker.last_name}`;

        return {
          id: `worker-${entry.id}`,
          timestamp: entry.changed_at,
          activity_type: 'WORKER' as const,
          event_type: entry.change_type,
          description: entry.description || entry.change_type.replace(/_/g, ' ').toLowerCase(),
          metadata: entry.metadata,
          worker_id: entry.worker_id,
          worker_name: workerName,
          property_name: entry.metadata?.property_name,
          job_id: entry.metadata?.job_id,
        };
      });

    const allEntries = [
      ...normalizedPropertyHistory,
      ...normalizedJobHistory,
      ...normalizedWorkerHistory,
    ];

    return allEntries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get activity statistics for dashboard
   */
  async getActivityStats(tenantId: string, days: number = 7): Promise<{
    total_events: number;
    properties_active: number;
    jobs_completed: number;
    workers_active: number;
    events_by_day: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activity = await this.getGlobalActivityFiltered(tenantId, {
      from_date: startDate,
      limit: 1000, // Get all events in the period
    });

    // Count unique entities
    const uniqueProperties = new Set(activity.filter(a => a.property_id).map(a => a.property_id));
    const uniqueWorkers = new Set(activity.filter(a => a.worker_id).map(a => a.worker_id));
    const completedJobs = activity.filter(
      a => a.activity_type === 'JOB' && a.event_type === 'COMPLETED'
    );

    // Group events by day
    const eventsByDay = new Map<string, number>();
    activity.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      eventsByDay.set(dateKey, (eventsByDay.get(dateKey) || 0) + 1);
    });

    const events_by_day = Array.from(eventsByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_events: activity.length,
      properties_active: uniqueProperties.size,
      jobs_completed: completedJobs.length,
      workers_active: uniqueWorkers.size,
      events_by_day,
    };
  }
}
