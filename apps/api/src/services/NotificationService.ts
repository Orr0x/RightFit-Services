import { PrismaClient } from '@rightfit/database'
import logger from '../utils/logger'
// import smsService from './SmsService' // Can be enabled later for SMS notifications

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

          // Send email notification (would integrate with SendGrid/SES in production)
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
   * Send email notification (placeholder - would integrate with SendGrid/AWS SES)
   */
  private async sendEmailNotification(notification: CertificateExpiryNotification): Promise<void> {
    // In production, integrate with SendGrid or AWS SES
    logger.info('Would send email notification', {
      to: notification.ownerEmail,
      subject: `Certificate Expiry Alert: ${notification.certificateType}`,
      message: `Your ${notification.certificateType} for ${notification.propertyName} expires in ${notification.daysUntilExpiry} days.`,
    })

    // Example SendGrid integration (commented out):
    // const msg = {
    //   to: notification.ownerEmail,
    //   from: 'notifications@rightfitservices.co.uk',
    //   subject: `Certificate Expiry Alert: ${notification.certificateType}`,
    //   text: `Your ${notification.certificateType} for ${notification.propertyName} expires in ${notification.daysUntilExpiry} days on ${notification.expiryDate.toLocaleDateString()}.`,
    //   html: `<strong>Certificate Expiry Alert</strong><br>Your ${notification.certificateType} for ${notification.propertyName} expires in <strong>${notification.daysUntilExpiry} days</strong> on ${notification.expiryDate.toLocaleDateString()}.`,
    // }
    // await sgMail.send(msg)
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
