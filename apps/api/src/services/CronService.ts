import * as cron from 'node-cron'
import notificationService from './NotificationService'
import logger from '../utils/logger'

class CronService {
  private jobs: any[] = []

  /**
   * Initialize all scheduled cron jobs
   */
  init() {
    // Run certificate expiry notifications daily at 9 AM UK time
    const certificateExpiryJob = cron.schedule(
      '0 9 * * *', // Every day at 9:00 AM
      async () => {
        logger.info('Running certificate expiry notification job')
        try {
          await notificationService.checkAndSendCertificateExpiryNotifications()
          logger.info('Certificate expiry notification job completed successfully')
        } catch (error: any) {
          logger.error('Certificate expiry notification job failed', {
            error: error.message,
          })
        }
      },
      {
        timezone: 'Europe/London', // UK timezone
      }
    )

    this.jobs.push(certificateExpiryJob)

    logger.info('Cron jobs initialized', {
      jobs: [
        {
          name: 'Certificate Expiry Notifications',
          schedule: '9:00 AM daily (UK time)',
        },
      ],
    })
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    this.jobs.forEach((job) => job.stop())
    logger.info('All cron jobs stopped')
  }

  /**
   * Manually trigger certificate expiry check (for testing)
   */
  async triggerCertificateExpiryCheck() {
    logger.info('Manually triggering certificate expiry check')
    await notificationService.checkAndSendCertificateExpiryNotifications()
  }
}

export default new CronService()
