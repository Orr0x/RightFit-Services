import { prisma, JobHistoryChangeType } from '@rightfit/database';

export interface RecordHistoryInput {
  cleaning_job_id: string;
  changed_by_user_id?: string;
  change_type: JobHistoryChangeType;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class CleaningJobHistoryService {
  /**
   * Record a single history entry
   */
  async recordChange(input: RecordHistoryInput) {
    return await prisma.cleaningJobHistory.create({
      data: {
        cleaning_job_id: input.cleaning_job_id,
        changed_by_user_id: input.changed_by_user_id,
        change_type: input.change_type,
        field_name: input.field_name,
        old_value: input.old_value,
        new_value: input.new_value,
        description: input.description,
        metadata: input.metadata,
      },
    });
  }

  /**
   * Record multiple history entries (for bulk updates)
   */
  async recordChanges(inputs: RecordHistoryInput[]) {
    return await prisma.cleaningJobHistory.createMany({
      data: inputs.map((input) => ({
        cleaning_job_id: input.cleaning_job_id,
        changed_by_user_id: input.changed_by_user_id,
        change_type: input.change_type,
        field_name: input.field_name,
        old_value: input.old_value,
        new_value: input.new_value,
        description: input.description,
        metadata: input.metadata,
      })),
    });
  }

  /**
   * Get history for a specific job
   */
  async getJobHistory(jobId: string) {
    return await prisma.cleaningJobHistory.findMany({
      where: {
        cleaning_job_id: jobId,
      },
      orderBy: {
        changed_at: 'desc',
      },
    });
  }

  /**
   * Compare old and new job data and record changes
   * This is a helper method to automatically detect and record changes
   */
  async recordJobUpdate(
    jobId: string,
    oldJob: any,
    newData: any,
    userId?: string
  ) {
    const changes: RecordHistoryInput[] = [];

    // Helper to format worker name
    const getWorkerName = async (workerId: string | null) => {
      if (!workerId) return null;
      const worker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { first_name: true, last_name: true },
      });
      return worker ? `${worker.first_name} ${worker.last_name}` : null;
    };

    // Check status change
    if (newData.status && newData.status !== oldJob.status) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'STATUS_CHANGED' as JobHistoryChangeType,
        field_name: 'status',
        old_value: oldJob.status,
        new_value: newData.status,
        description: `Status changed from ${oldJob.status} to ${newData.status}`,
      });
    }

    // Check worker assignment
    if ('assigned_worker_id' in newData && newData.assigned_worker_id !== oldJob.assigned_worker_id) {
      let changeType: JobHistoryChangeType;
      let description: string;

      const oldWorkerName = await getWorkerName(oldJob.assigned_worker_id);
      const newWorkerName = await getWorkerName(newData.assigned_worker_id);

      if (!oldJob.assigned_worker_id && newData.assigned_worker_id) {
        changeType = 'WORKER_ASSIGNED' as JobHistoryChangeType;
        description = `Worker assigned: ${newWorkerName}`;
      } else if (oldJob.assigned_worker_id && !newData.assigned_worker_id) {
        changeType = 'WORKER_UNASSIGNED' as JobHistoryChangeType;
        description = `Worker unassigned: ${oldWorkerName}`;
      } else {
        changeType = 'WORKER_CHANGED' as JobHistoryChangeType;
        description = `Worker changed from ${oldWorkerName} to ${newWorkerName}`;
      }

      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: changeType,
        field_name: 'assigned_worker_id',
        old_value: oldJob.assigned_worker_id || null,
        new_value: newData.assigned_worker_id || null,
        description,
      });
    }

    // Check date change
    if (newData.scheduled_date) {
      const oldDate = new Date(oldJob.scheduled_date).toISOString().split('T')[0];
      const newDate = typeof newData.scheduled_date === 'string'
        ? newData.scheduled_date
        : new Date(newData.scheduled_date).toISOString().split('T')[0];

      if (oldDate !== newDate) {
        changes.push({
          cleaning_job_id: jobId,
          changed_by_user_id: userId,
          change_type: 'DATE_CHANGED' as JobHistoryChangeType,
          field_name: 'scheduled_date',
          old_value: oldDate,
          new_value: newDate,
          description: `Date changed from ${new Date(oldDate).toLocaleDateString()} to ${new Date(newDate).toLocaleDateString()}`,
        });
      }
    }

    // Check time changes
    if (
      newData.scheduled_start_time &&
      newData.scheduled_start_time !== oldJob.scheduled_start_time
    ) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'TIME_CHANGED' as JobHistoryChangeType,
        field_name: 'scheduled_start_time',
        old_value: oldJob.scheduled_start_time,
        new_value: newData.scheduled_start_time,
        description: `Start time changed from ${oldJob.scheduled_start_time} to ${newData.scheduled_start_time}`,
      });
    }

    if (
      newData.scheduled_end_time &&
      newData.scheduled_end_time !== oldJob.scheduled_end_time
    ) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'TIME_CHANGED' as JobHistoryChangeType,
        field_name: 'scheduled_end_time',
        old_value: oldJob.scheduled_end_time,
        new_value: newData.scheduled_end_time,
        description: `End time changed from ${oldJob.scheduled_end_time} to ${newData.scheduled_end_time}`,
      });
    }

    // Check completion notes
    if (
      newData.completion_notes &&
      newData.completion_notes !== oldJob.completion_notes
    ) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'NOTES_UPDATED' as JobHistoryChangeType,
        field_name: 'completion_notes',
        old_value: oldJob.completion_notes || null,
        new_value: newData.completion_notes,
        description: 'Completion notes updated',
      });
    }

    // Check price changes
    if (newData.actual_price !== undefined && newData.actual_price !== oldJob.actual_price) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'PRICE_CHANGED' as JobHistoryChangeType,
        field_name: 'actual_price',
        old_value: oldJob.actual_price?.toString() || null,
        new_value: newData.actual_price?.toString(),
        description: `Price changed from ${oldJob.actual_price || 'not set'} to ${newData.actual_price}`,
      });
    }

    // Check photo additions
    if (newData.before_photos && newData.before_photos.length > (oldJob.before_photos?.length || 0)) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'PHOTO_ADDED' as JobHistoryChangeType,
        field_name: 'before_photos',
        new_value: `${newData.before_photos.length}`,
        description: 'Before photos added',
      });
    }

    if (newData.after_photos && newData.after_photos.length > (oldJob.after_photos?.length || 0)) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'PHOTO_ADDED' as JobHistoryChangeType,
        field_name: 'after_photos',
        new_value: `${newData.after_photos.length}`,
        description: 'After photos added',
      });
    }

    if (newData.issue_photos && newData.issue_photos.length > (oldJob.issue_photos?.length || 0)) {
      changes.push({
        cleaning_job_id: jobId,
        changed_by_user_id: userId,
        change_type: 'PHOTO_ADDED' as JobHistoryChangeType,
        field_name: 'issue_photos',
        new_value: `${newData.issue_photos.length}`,
        description: 'Issue photos added',
      });
    }

    // Record all changes
    if (changes.length > 0) {
      await this.recordChanges(changes);
    }

    return changes;
  }

  /**
   * Record job creation
   */
  async recordJobCreation(jobId: string, userId?: string) {
    return await this.recordChange({
      cleaning_job_id: jobId,
      changed_by_user_id: userId,
      change_type: 'CREATED' as JobHistoryChangeType,
      description: 'Job created',
    });
  }

  /**
   * Record maintenance issue creation from this cleaning job
   */
  async recordMaintenanceIssueCreated(
    jobId: string,
    maintenanceJobId: string,
    issueTitle: string,
    priority: string,
    userId?: string
  ) {
    return await this.recordChange({
      cleaning_job_id: jobId,
      changed_by_user_id: userId,
      change_type: 'MAINTENANCE_ISSUE_CREATED' as JobHistoryChangeType,
      field_name: 'maintenance_job_id',
      new_value: maintenanceJobId,
      description: `Maintenance issue reported: ${issueTitle} (${priority} priority)`,
      metadata: {
        maintenance_job_id: maintenanceJobId,
        issue_title: issueTitle,
        priority: priority,
      },
    });
  }
}
