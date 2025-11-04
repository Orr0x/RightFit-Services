import { prisma, PropertyHistoryChangeType } from '@rightfit/database';

export interface RecordPropertyHistoryInput {
  property_id: string;
  changed_by_user_id?: string;
  change_type: PropertyHistoryChangeType;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class PropertyHistoryService {
  /**
   * Record a single history entry
   */
  async recordChange(input: RecordPropertyHistoryInput) {
    return await prisma.propertyHistory.create({
      data: {
        property_id: input.property_id,
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
   * Record multiple history entries
   */
  async recordChanges(inputs: RecordPropertyHistoryInput[]) {
    return await prisma.propertyHistory.createMany({
      data: inputs.map((input) => ({
        property_id: input.property_id,
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
   * Get history for a specific property
   */
  async getPropertyHistory(propertyId: string, limit?: number) {
    return await prisma.propertyHistory.findMany({
      where: {
        property_id: propertyId,
      },
      orderBy: {
        changed_at: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Record property creation
   */
  async recordPropertyCreated(propertyId: string, propertyName: string, userId?: string) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'PROPERTY_CREATED' as PropertyHistoryChangeType,
      description: `Property "${propertyName}" created`,
    });
  }

  /**
   * Record property update
   */
  async recordPropertyUpdated(
    propertyId: string,
    fieldName: string,
    oldValue: string,
    newValue: string,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'PROPERTY_UPDATED' as PropertyHistoryChangeType,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      description: `${fieldName} updated`,
    });
  }

  /**
   * Record cleaning job scheduled
   */
  async recordCleaningJobScheduled(
    propertyId: string,
    jobId: string,
    scheduledDate: string,
    workerName?: string,
    userId?: string
  ) {
    const workerText = workerName ? ` with ${workerName}` : '';
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'CLEANING_JOB_SCHEDULED' as PropertyHistoryChangeType,
      new_value: jobId,
      description: `Cleaning scheduled for ${scheduledDate}${workerText}`,
      metadata: {
        cleaning_job_id: jobId,
        scheduled_date: scheduledDate,
        worker_name: workerName,
      },
    });
  }

  /**
   * Record cleaning job started
   */
  async recordCleaningJobStarted(
    propertyId: string,
    jobId: string,
    workerName: string,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'CLEANING_JOB_STARTED' as PropertyHistoryChangeType,
      new_value: jobId,
      description: `Cleaning started by ${workerName}`,
      metadata: {
        cleaning_job_id: jobId,
        worker_name: workerName,
      },
    });
  }

  /**
   * Record cleaning job completed
   */
  async recordCleaningJobCompleted(
    propertyId: string,
    jobId: string,
    workerName: string,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'CLEANING_JOB_COMPLETED' as PropertyHistoryChangeType,
      new_value: jobId,
      description: `Cleaning completed by ${workerName}`,
      metadata: {
        cleaning_job_id: jobId,
        worker_name: workerName,
      },
    });
  }

  /**
   * Record maintenance job created
   */
  async recordMaintenanceJobCreated(
    propertyId: string,
    jobId: string,
    title: string,
    priority: string,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'MAINTENANCE_JOB_CREATED' as PropertyHistoryChangeType,
      new_value: jobId,
      description: `Maintenance job created: ${title} (${priority} priority)`,
      metadata: {
        maintenance_job_id: jobId,
        title: title,
        priority: priority,
      },
    });
  }

  /**
   * Record maintenance job completed
   */
  async recordMaintenanceJobCompleted(
    propertyId: string,
    jobId: string,
    title: string,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'MAINTENANCE_JOB_COMPLETED' as PropertyHistoryChangeType,
      new_value: jobId,
      description: `Maintenance completed: ${title}`,
      metadata: {
        maintenance_job_id: jobId,
        title: title,
      },
    });
  }

  /**
   * Record contract created
   */
  async recordContractCreated(
    propertyId: string,
    contractId: string,
    monthlyFee: number,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'CONTRACT_CREATED' as PropertyHistoryChangeType,
      new_value: contractId,
      description: `Cleaning contract created (£${monthlyFee}/month)`,
      metadata: {
        contract_id: contractId,
        monthly_fee: monthlyFee,
      },
    });
  }

  /**
   * Record contract renewed
   */
  async recordContractRenewed(
    propertyId: string,
    contractId: string,
    newEndDate: string,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'CONTRACT_RENEWED' as PropertyHistoryChangeType,
      new_value: contractId,
      description: `Contract renewed until ${newEndDate}`,
      metadata: {
        contract_id: contractId,
        new_end_date: newEndDate,
      },
    });
  }

  /**
   * Record certificate uploaded
   */
  async recordCertificateUploaded(
    propertyId: string,
    certificateId: string,
    certificateType: string,
    expiryDate: string,
    userId?: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      changed_by_user_id: userId,
      change_type: 'CERTIFICATE_UPLOADED' as PropertyHistoryChangeType,
      new_value: certificateId,
      description: `${certificateType} certificate uploaded (expires ${expiryDate})`,
      metadata: {
        certificate_id: certificateId,
        certificate_type: certificateType,
        expiry_date: expiryDate,
      },
    });
  }

  /**
   * Record certificate expiring soon
   */
  async recordCertificateExpiringSoon(
    propertyId: string,
    certificateId: string,
    certificateType: string,
    expiryDate: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      change_type: 'CERTIFICATE_EXPIRING_SOON' as PropertyHistoryChangeType,
      new_value: certificateId,
      description: `${certificateType} certificate expiring soon (${expiryDate})`,
      metadata: {
        certificate_id: certificateId,
        certificate_type: certificateType,
        expiry_date: expiryDate,
      },
    });
  }

  /**
   * Record certificate expired
   */
  async recordCertificateExpired(
    propertyId: string,
    certificateId: string,
    certificateType: string,
    expiryDate: string
  ) {
    return await this.recordChange({
      property_id: propertyId,
      change_type: 'CERTIFICATE_EXPIRED' as PropertyHistoryChangeType,
      new_value: certificateId,
      description: `${certificateType} certificate expired (${expiryDate})`,
      metadata: {
        certificate_id: certificateId,
        certificate_type: certificateType,
        expiry_date: expiryDate,
      },
    });
  }
}
