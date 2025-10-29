import { PrismaClient } from '@rightfit/database'
import logger from '../utils/logger'
import pushNotificationService from './PushNotificationService'
import emailService from './EmailService'
// import smsService from './SmsService' // Will be enabled when phone field is added to User model

const prisma = new PrismaClient()

interface CertificateExpiryNotification {
  certificateId: string
  propertyName: string
  certificateType: string
  expiryDate: Date
  daysUntilExpiry: number
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
}

class NotificationService {
  /**
   * Check for expiring certificates and send notifications
   * Sends alerts at 60, 30, and 7 days before expiry
   */
  async checkAndSendCertificateExpiryNotifications(): Promise<void> {
    try {
      const alertDays = [60, 30, 7] // Days before expiry to send alerts

      for (const days of alertDays) {
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + days)

        // Find certificates expiring on this target date (within 24 hour window)
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const expiringCertificates = await prisma.certificate.findMany({
          where: {
            deleted_at: null,
            expiry_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            property: {
              include: {
                owner: true,
              },
            },
          },
        })

        for (const cert of expiringCertificates) {
          const notification: CertificateExpiryNotification = {
            certificateId: cert.id,
            propertyName: cert.property.name,
            certificateType: this.formatCertificateType(cert.certificate_type),
            expiryDate: cert.expiry_date,
            daysUntilExpiry: days,
            ownerName: cert.property.owner.full_name,
            ownerEmail: cert.property.owner.email,
          }

          // Log notification
          logger.info('Certificate expiry notification', {
            certificate_id: cert.id,
            property: notification.propertyName,
            type: notification.certificateType,
            days_until_expiry: days,
          })

          // Send push notification
          await this.sendPushNotification(notification, days)

          // Send email notification
          await this.sendEmailNotification(notification)

          // Send SMS notification if phone number available
          // await this.sendSMSNotification(notification)
        }

        if (expiringCertificates.length > 0) {
          logger.info(`Sent ${expiringCertificates.length} certificate expiry notifications for ${days} days`, {
            count: expiringCertificates.length,
            days_ahead: days,
          })
        }
      }

      // Check for expired certificates
      await this.checkExpiredCertificates()
    } catch (error: any) {
      logger.error('Error checking certificate expiry notifications', {
        error: error.message,
      })
    }
  }

  /**
   * Check for certificates that have already expired
   */
  private async checkExpiredCertificates(): Promise<void> {
    const now = new Date()

    const expiredCertificates = await prisma.certificate.findMany({
      where: {
        deleted_at: null,
        expiry_date: {
          lt: now,
        },
      },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
      },
    })

    for (const cert of expiredCertificates) {
      const daysSinceExpiry = Math.ceil((now.getTime() - cert.expiry_date.getTime()) / (1000 * 60 * 60 * 24))

      logger.warn('Expired certificate detected', {
        certificate_id: cert.id,
        property: cert.property.name,
        type: cert.certificate_type,
        days_since_expiry: daysSinceExpiry,
      })

      // Send urgent notification if just expired (within last 2 days)
      if (daysSinceExpiry <= 2) {
        const notification: CertificateExpiryNotification = {
          certificateId: cert.id,
          propertyName: cert.property.name,
          certificateType: this.formatCertificateType(cert.certificate_type),
          expiryDate: cert.expiry_date,
          daysUntilExpiry: -daysSinceExpiry,
          ownerName: cert.property.owner.full_name,
          ownerEmail: cert.property.owner.email,
        }

        await this.sendUrgentExpiredNotification(notification)
      }
    }
  }

  /**
   * Send push notification for certificate expiry
   */
  private async sendPushNotification(
    notification: CertificateExpiryNotification,
    daysUntilExpiry: number
  ): Promise<void> {
    try {
      // Determine priority and message based on days until expiry
      let priority: 'default' | 'normal' | 'high' = 'default'
      let title = ''
      let body = ''

      if (daysUntilExpiry === 60) {
        title = 'Certificate Renewal Reminder'
        body = `Your ${notification.certificateType} for ${notification.propertyName} expires in 60 days`
      } else if (daysUntilExpiry === 30) {
        priority = 'normal'
        title = 'Certificate Expiring Soon'
        body = `Your ${notification.certificateType} for ${notification.propertyName} expires in 30 days. Please renew soon.`
      } else if (daysUntilExpiry === 7) {
        priority = 'high'
        title = 'URGENT: Certificate Expiring'
        body = `Your ${notification.certificateType} for ${notification.propertyName} expires in 7 days! Renew immediately.`
      } else if (daysUntilExpiry < 0) {
        priority = 'high'
        const daysExpired = Math.abs(daysUntilExpiry)
        title = 'EXPIRED: Certificate Renewal Required'
        body = `Your ${notification.certificateType} for ${notification.propertyName} expired ${daysExpired} days ago. Renew now to stay compliant.`
      }

      // Get certificate to find property and owner information
      const certificate = await prisma.certificate.findUnique({
        where: { id: notification.certificateId },
        include: {
          property: {
            include: {
              owner: true,
            },
          },
        },
      })

      if (!certificate || !certificate.property) {
        logger.warn('Certificate or property not found', {
          certificate_id: notification.certificateId,
        })
        return
      }

      // Send push notification
      await pushNotificationService.sendNotification({
        userId: certificate.property.owner.id,
        title,
        body,
        notificationType: 'CERTIFICATE_EXPIRY',
        priority,
        data: {
          certificate_id: notification.certificateId,
          property_name: notification.propertyName,
          certificate_type: notification.certificateType,
          expiry_date: notification.expiryDate.toISOString(),
          days_until_expiry: daysUntilExpiry,
          tenant_id: certificate.property.tenant_id,
          deep_link: `rightfit://certificates/${notification.certificateId}`,
        },
      })

      logger.info('Push notification sent for certificate expiry', {
        certificate_id: notification.certificateId,
        days_until_expiry: daysUntilExpiry,
      })
    } catch (error: any) {
      logger.error('Failed to send push notification for certificate expiry', {
        error: error.message,
        certificate_id: notification.certificateId,
      })
    }
  }

  /**
   * Send email notification using SendGrid
   */
  private async sendEmailNotification(notification: CertificateExpiryNotification): Promise<void> {
    try {
      await emailService.sendCertificateExpiryEmail({
        to: notification.ownerEmail,
        ownerName: notification.ownerName,
        certificateType: notification.certificateType,
        propertyName: notification.propertyName,
        expiryDate: notification.expiryDate,
        daysUntilExpiry: notification.daysUntilExpiry,
      })
    } catch (error: any) {
      logger.error('Failed to send email notification', {
        error: error.message,
        certificate_id: notification.certificateId,
      })
    }
  }

  /**
   * Send SMS notification (uses existing SmsService)
   * Commented out for now - can be enabled when needed
   */
  // private async sendSMSNotification(notification: CertificateExpiryNotification): Promise<void> {
  //   if (!notification.ownerPhone) return

  //   const message = `ALERT: Your ${notification.certificateType} for ${notification.propertyName} expires in ${notification.daysUntilExpiry} days. Please renew before ${notification.expiryDate.toLocaleDateString('en-GB')}.`

  //   await smsService.sendSms({
  //     to: notification.ownerPhone,
  //     message,
  //     metadata: {
  //       type: 'certificate_expiry',
  //       certificate_id: notification.certificateId,
  //       days_until_expiry: notification.daysUntilExpiry,
  //     },
  //   })
  // }

  /**
   * Send urgent notification for expired certificates
   */
  private async sendUrgentExpiredNotification(notification: CertificateExpiryNotification): Promise<void> {
    logger.error('URGENT: Certificate has expired', {
      certificate_id: notification.certificateId,
      property: notification.propertyName,
      type: notification.certificateType,
      expired_days_ago: Math.abs(notification.daysUntilExpiry),
    })

    // Would send urgent email/SMS in production
  }

  /**
   * Format certificate type for display
   */
  private formatCertificateType(type: string): string {
    const types: Record<string, string> = {
      GAS_SAFETY: 'Gas Safety Certificate',
      ELECTRICAL: 'Electrical Safety Certificate (EICR)',
      EPC: 'Energy Performance Certificate',
      STL_LICENSE: 'Short-Term Let License',
      OTHER: 'Certificate',
    }
    return types[type] || type
  }

  /**
   * Get dashboard summary of certificate status
   */
  async getCertificateSummary(tenantId: string) {
    const now = new Date()

    const [total, expiringSoon, expired] = await Promise.all([
      // Total active certificates
      prisma.certificate.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
        },
      }),

      // Expiring in next 60 days
      prisma.certificate.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          expiry_date: {
            gte: now,
            lte: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          },
        },
      }),

      // Already expired
      prisma.certificate.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          expiry_date: {
            lt: now,
          },
        },
      }),
    ])

    return {
      total,
      expiring_soon: expiringSoon,
      expired,
      up_to_date: total - expiringSoon - expired,
    }
  }
}

export default new NotificationService()
