import { PrismaClient, WorkerHistoryChangeType } from '@prisma/client';

const prisma = new PrismaClient();

interface RecordWorkerHistoryInput {
  worker_id: string;
  changed_by_user_id?: string;
  change_type: WorkerHistoryChangeType;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class WorkerHistoryService {
  /**
   * Core method to record a single history entry
   */
  async recordChange(input: RecordWorkerHistoryInput) {
    return await prisma.workerHistory.create({
      data: {
        worker_id: input.worker_id,
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
   * Get all history for a worker
   */
  async getWorkerHistory(workerId: string, limit?: number) {
    return await prisma.workerHistory.findMany({
      where: { worker_id: workerId },
      orderBy: { changed_at: 'desc' },
      take: limit,
    });
  }

  /**
   * Get history filtered by change type
   */
  async getWorkerHistoryByType(workerId: string, changeType: WorkerHistoryChangeType) {
    return await prisma.workerHistory.findMany({
      where: {
        worker_id: workerId,
        change_type: changeType,
      },
      orderBy: { changed_at: 'desc' },
    });
  }

  /**
   * Get history within a date range
   */
  async getWorkerHistoryDateRange(workerId: string, startDate: Date, endDate: Date) {
    return await prisma.workerHistory.findMany({
      where: {
        worker_id: workerId,
        changed_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { changed_at: 'desc' },
    });
  }

  // ============================================================================
  // PROFILE EVENTS
  // ============================================================================

  async recordWorkerCreated(workerId: string, workerName: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'WORKER_CREATED' as WorkerHistoryChangeType,
      description: `Worker "${workerName}" created`,
      metadata: { worker_name: workerName },
    });
  }

  async recordProfileUpdated(workerId: string, fieldName: string, oldValue: string, newValue: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'PROFILE_UPDATED' as WorkerHistoryChangeType,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      description: `${fieldName} changed from "${oldValue}" to "${newValue}"`,
    });
  }

  async recordPhotoUploaded(workerId: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'PHOTO_UPLOADED' as WorkerHistoryChangeType,
      description: 'Profile photo uploaded',
    });
  }

  async recordContactInfoUpdated(workerId: string, fieldName: string, oldValue: string, newValue: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'CONTACT_INFO_UPDATED' as WorkerHistoryChangeType,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      description: `${fieldName} updated`,
    });
  }

  async recordRateChanged(workerId: string, oldRate: string, newRate: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'RATE_CHANGED' as WorkerHistoryChangeType,
      field_name: 'hourly_rate',
      old_value: oldRate,
      new_value: newRate,
      description: `Hourly rate changed from £${oldRate} to £${newRate}`,
    });
  }

  async recordStatusChanged(workerId: string, oldStatus: string, newStatus: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'STATUS_CHANGED' as WorkerHistoryChangeType,
      field_name: 'is_active',
      old_value: oldStatus,
      new_value: newStatus,
      description: `Status changed from ${oldStatus} to ${newStatus}`,
    });
  }

  // ============================================================================
  // JOB EVENTS
  // ============================================================================

  async recordJobAssigned(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', propertyName?: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'JOB_ASSIGNED' as WorkerHistoryChangeType,
      description: `Assigned to ${jobType.toLowerCase()} job${propertyName ? ` at ${propertyName}` : ''}`,
      metadata: {
        job_id: jobId,
        job_type: jobType,
        property_name: propertyName,
      },
    });
  }

  async recordJobReassigned(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', oldWorkerName: string, newWorkerName: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'JOB_REASSIGNED' as WorkerHistoryChangeType,
      description: `Job reassigned from ${oldWorkerName} to ${newWorkerName}`,
      metadata: {
        job_id: jobId,
        job_type: jobType,
        old_worker: oldWorkerName,
        new_worker: newWorkerName,
      },
    });
  }

  async recordJobUnassigned(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', reason?: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'JOB_UNASSIGNED' as WorkerHistoryChangeType,
      description: `Unassigned from ${jobType.toLowerCase()} job${reason ? `: ${reason}` : ''}`,
      metadata: {
        job_id: jobId,
        job_type: jobType,
        reason,
      },
    });
  }

  async recordJobStarted(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', propertyName?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'JOB_STARTED' as WorkerHistoryChangeType,
      description: `Started ${jobType.toLowerCase()} job${propertyName ? ` at ${propertyName}` : ''}`,
      metadata: {
        job_id: jobId,
        job_type: jobType,
        property_name: propertyName,
      },
    });
  }

  async recordJobCompleted(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', propertyName?: string, duration?: number) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'JOB_COMPLETED' as WorkerHistoryChangeType,
      description: `Completed ${jobType.toLowerCase()} job${propertyName ? ` at ${propertyName}` : ''}${duration ? ` (${duration} hours)` : ''}`,
      metadata: {
        job_id: jobId,
        job_type: jobType,
        property_name: propertyName,
        duration_hours: duration,
      },
    });
  }

  async recordJobCancelled(workerId: string, jobId: string, jobType: 'CLEANING' | 'MAINTENANCE', reason?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'JOB_CANCELLED' as WorkerHistoryChangeType,
      description: `${jobType} job cancelled${reason ? `: ${reason}` : ''}`,
      metadata: {
        job_id: jobId,
        job_type: jobType,
        reason,
      },
    });
  }

  async recordJobRescheduled(
    workerId: string,
    jobId: string,
    jobType: 'CLEANING' | 'MAINTENANCE',
    propertyName: string | undefined,
    oldDate: string,
    newDate: string,
    userId?: string
  ) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'JOB_ASSIGNED' as WorkerHistoryChangeType, // Reuse JOB_ASSIGNED for rescheduling
      description: `Job rescheduled${propertyName ? ` at ${propertyName}` : ''}: ${new Date(oldDate).toLocaleDateString('en-GB')} → ${new Date(newDate).toLocaleDateString('en-GB')}`,
      old_value: oldDate,
      new_value: newDate,
      metadata: {
        job_id: jobId,
        job_type: jobType,
        property_name: propertyName,
        old_date: oldDate,
        new_date: newDate,
        is_reschedule: true,
      },
    });
  }

  // ============================================================================
  // CERTIFICATE EVENTS
  // ============================================================================

  async recordCertificateUploaded(workerId: string, certId: string, certName: string, expiryDate?: Date, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'CERTIFICATE_UPLOADED' as WorkerHistoryChangeType,
      description: `Certificate uploaded: ${certName}${expiryDate ? ` (expires ${expiryDate.toLocaleDateString('en-GB')})` : ''}`,
      metadata: {
        certificate_id: certId,
        certificate_name: certName,
        expiry_date: expiryDate?.toISOString(),
      },
    });
  }

  async recordCertificateRenewed(workerId: string, certId: string, certName: string, newExpiryDate: Date, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'CERTIFICATE_RENEWED' as WorkerHistoryChangeType,
      description: `Certificate renewed: ${certName} (new expiry: ${newExpiryDate.toLocaleDateString('en-GB')})`,
      metadata: {
        certificate_id: certId,
        certificate_name: certName,
        new_expiry_date: newExpiryDate.toISOString(),
      },
    });
  }

  async recordCertificateExpiring(workerId: string, certId: string, certName: string, expiryDate: Date, daysUntilExpiry: number) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'CERTIFICATE_EXPIRING' as WorkerHistoryChangeType,
      description: `Certificate expiring soon: ${certName} (${daysUntilExpiry} days)`,
      metadata: {
        certificate_id: certId,
        certificate_name: certName,
        expiry_date: expiryDate.toISOString(),
        days_until_expiry: daysUntilExpiry,
      },
    });
  }

  async recordCertificateExpired(workerId: string, certId: string, certName: string, expiryDate: Date) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'CERTIFICATE_EXPIRED' as WorkerHistoryChangeType,
      description: `Certificate expired: ${certName}`,
      metadata: {
        certificate_id: certId,
        certificate_name: certName,
        expiry_date: expiryDate.toISOString(),
      },
    });
  }

  async recordCertificateRemoved(workerId: string, certId: string, certName: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'CERTIFICATE_REMOVED' as WorkerHistoryChangeType,
      description: `Certificate removed: ${certName}`,
      metadata: {
        certificate_id: certId,
        certificate_name: certName,
      },
    });
  }

  // ============================================================================
  // AVAILABILITY EVENTS
  // ============================================================================

  async recordAvailabilityUpdated(workerId: string, oldAvailability: string, newAvailability: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'AVAILABILITY_UPDATED' as WorkerHistoryChangeType,
      description: 'Availability updated',
      old_value: oldAvailability,
      new_value: newAvailability,
    });
  }

  async recordTimeOffRequested(workerId: string, startDate: Date, endDate: Date, reason?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'TIME_OFF_REQUESTED' as WorkerHistoryChangeType,
      description: `Time off requested: ${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}${reason ? ` (${reason})` : ''}`,
      metadata: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        reason,
      },
    });
  }

  async recordTimeOffApproved(workerId: string, startDate: Date, endDate: Date, approvedBy?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'TIME_OFF_APPROVED' as WorkerHistoryChangeType,
      description: `Time off approved: ${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`,
      metadata: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        approved_by: approvedBy,
      },
    });
  }

  async recordTimeOffDeclined(workerId: string, startDate: Date, endDate: Date, reason?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'TIME_OFF_DECLINED' as WorkerHistoryChangeType,
      description: `Time off declined: ${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}${reason ? ` (${reason})` : ''}`,
      metadata: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        reason,
      },
    });
  }

  // ============================================================================
  // PERFORMANCE EVENTS
  // ============================================================================

  async recordRatingReceived(workerId: string, jobId: string, rating: number, propertyName?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'RATING_RECEIVED' as WorkerHistoryChangeType,
      description: `Received ${rating}-star rating${propertyName ? ` from ${propertyName}` : ''}`,
      metadata: {
        job_id: jobId,
        rating,
        property_name: propertyName,
      },
    });
  }

  async recordMilestoneReached(workerId: string, milestoneType: string, count: number) {
    let description = '';
    switch (milestoneType) {
      case 'JOBS_COMPLETED':
        description = `Milestone: ${count}${count === 1 ? 'st' : count === 2 ? 'nd' : count === 3 ? 'rd' : 'th'} job completed!`;
        break;
      default:
        description = `Milestone reached: ${milestoneType}`;
    }

    return await this.recordChange({
      worker_id: workerId,
      change_type: 'MILESTONE_REACHED' as WorkerHistoryChangeType,
      description,
      metadata: {
        milestone_type: milestoneType,
        count,
      },
    });
  }

  async recordComplaintFiled(workerId: string, complaintDetails: string, jobId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'COMPLAINT_FILED' as WorkerHistoryChangeType,
      description: `Complaint filed: ${complaintDetails}`,
      metadata: {
        job_id: jobId,
        complaint: complaintDetails,
      },
    });
  }

  async recordCommendationReceived(workerId: string, commendation: string, jobId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      change_type: 'COMMENDATION_RECEIVED' as WorkerHistoryChangeType,
      description: `Commendation: ${commendation}`,
      metadata: {
        job_id: jobId,
        commendation,
      },
    });
  }

  // ============================================================================
  // OTHER EVENTS
  // ============================================================================

  async recordNoteAdded(workerId: string, note: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'NOTE_ADDED' as WorkerHistoryChangeType,
      description: `Note added: ${note}`,
      metadata: { note },
    });
  }

  async recordEmergencyContactUpdated(workerId: string, oldContact: string, newContact: string, userId?: string) {
    return await this.recordChange({
      worker_id: workerId,
      changed_by_user_id: userId,
      change_type: 'EMERGENCY_CONTACT_UPDATED' as WorkerHistoryChangeType,
      description: 'Emergency contact updated',
      old_value: oldContact,
      new_value: newContact,
    });
  }

  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================

  async getWorkerJobCount(workerId: string): Promise<number> {
    const completedJobs = await prisma.workerHistory.count({
      where: {
        worker_id: workerId,
        change_type: 'JOB_COMPLETED' as WorkerHistoryChangeType,
      },
    });
    return completedJobs;
  }

  async getWorkerAverageRating(workerId: string): Promise<number> {
    const ratings = await prisma.workerHistory.findMany({
      where: {
        worker_id: workerId,
        change_type: 'RATING_RECEIVED' as WorkerHistoryChangeType,
      },
    });

    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc, r) => acc + ((r.metadata as any)?.rating || 0), 0);
    return sum / ratings.length;
  }

  async getWorkerCompletionRate(workerId: string): Promise<number> {
    const assigned = await prisma.workerHistory.count({
      where: {
        worker_id: workerId,
        change_type: 'JOB_ASSIGNED' as WorkerHistoryChangeType,
      },
    });

    const completed = await prisma.workerHistory.count({
      where: {
        worker_id: workerId,
        change_type: 'JOB_COMPLETED' as WorkerHistoryChangeType,
      },
    });

    if (assigned === 0) return 0;
    return (completed / assigned) * 100;
  }
}
