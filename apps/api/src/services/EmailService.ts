import { Resend } from 'resend'
import logger from '../utils/logger'

class EmailService {
  private resend: Resend | null = null
  private isConfigured: boolean = false

  constructor() {
    const apiKey = process.env.RESEND_API_KEY

    if (apiKey) {
      this.resend = new Resend(apiKey)
      this.isConfigured = true
      logger.info('Resend email service configured')
    } else {
      logger.warn('Resend API key not configured - email notifications will be logged only')
    }
  }

  /**
   * Send certificate expiry email notification
   */
  async sendCertificateExpiryEmail(params: {
    to: string
    ownerName: string
    certificateType: string
    propertyName: string
    expiryDate: Date
    daysUntilExpiry: number
  }): Promise<void> {
    try {
      const { to, ownerName, certificateType, propertyName, expiryDate, daysUntilExpiry } = params

      // Determine urgency and message
      let subject = ''
      let urgencyLabel = ''
      let urgencyColor = '#FFA500' // Orange

      if (daysUntilExpiry === 60) {
        subject = `Certificate Renewal Reminder - ${certificateType}`
        urgencyLabel = 'REMINDER'
        urgencyColor = '#4CAF50' // Green
      } else if (daysUntilExpiry === 30) {
        subject = `Certificate Expiring Soon - ${certificateType}`
        urgencyLabel = 'EXPIRING SOON'
        urgencyColor = '#FF9800' // Orange
      } else if (daysUntilExpiry === 7) {
        subject = `URGENT: Certificate Expires in 7 Days - ${certificateType}`
        urgencyLabel = 'URGENT'
        urgencyColor = '#F44336' // Red
      } else if (daysUntilExpiry < 0) {
        subject = `EXPIRED: Certificate Renewal Required - ${certificateType}`
        urgencyLabel = 'EXPIRED'
        urgencyColor = '#D32F2F' // Dark Red
      }

      const formattedDate = expiryDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      // Email HTML template
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .urgency-badge {
      display: inline-block;
      background: ${urgencyColor};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .certificate-details {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
      text-align: right;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="urgency-badge">${urgencyLabel}</div>
    <h1 style="margin: 10px 0;">Certificate ${daysUntilExpiry >= 0 ? 'Expiry' : 'Expired'} Alert</h1>
  </div>

  <div class="content">
    <p>Dear ${ownerName},</p>

    <p>This is an important notification regarding your property compliance certificate.</p>

    <div class="certificate-details">
      <div class="detail-row">
        <span class="detail-label">Certificate Type:</span>
        <span class="detail-value">${certificateType}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Property:</span>
        <span class="detail-value">${propertyName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Expiry Date:</span>
        <span class="detail-value">${formattedDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value" style="color: ${urgencyColor}; font-weight: bold;">
          ${daysUntilExpiry >= 0 ? `Expires in ${daysUntilExpiry} days` : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
        </span>
      </div>
    </div>

    ${daysUntilExpiry <= 7 ? `
    <div class="warning-box">
      <strong>⚠️ Action Required:</strong> Please renew this certificate immediately to maintain compliance and avoid potential fines or booking cancellations.
    </div>
    ` : ''}

    <p>
      <a href="https://app.rightfitservices.co.uk/certificates" class="cta-button">
        View Certificate Details
      </a>
    </p>

    <p><strong>Why this matters:</strong></p>
    <ul>
      <li>UK landlords must maintain valid compliance certificates</li>
      <li>Expired certificates can result in fines up to £30,000</li>
      <li>Ensure your property remains safe and legally compliant</li>
    </ul>

    <p>If you have already renewed this certificate, please upload it to your RightFit Services account.</p>
  </div>

  <div class="footer">
    <p>RightFit Services - Property Management Made Simple</p>
    <p>This is an automated notification. Please do not reply to this email.</p>
    <p>Need help? Contact us at <a href="mailto:support@rightfitservices.co.uk">support@rightfitservices.co.uk</a></p>
  </div>
</body>
</html>
      `

      // Plain text version
      const textContent = `
Certificate ${daysUntilExpiry >= 0 ? 'Expiry' : 'Expired'} Alert

Dear ${ownerName},

${urgencyLabel}: Your ${certificateType} for ${propertyName} ${daysUntilExpiry >= 0 ? `expires in ${daysUntilExpiry} days` : `expired ${Math.abs(daysUntilExpiry)} days ago`} on ${formattedDate}.

Please renew this certificate to maintain compliance.

View details: https://app.rightfitservices.co.uk/certificates

RightFit Services
      `

      if (this.isConfigured && this.resend) {
        await this.resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'notifications@rightfitservices.co.uk',
          to,
          subject,
          text: textContent,
          html: htmlContent,
        })

        logger.info('Certificate expiry email sent', {
          to,
          certificate_type: certificateType,
          days_until_expiry: daysUntilExpiry,
        })
      } else {
        logger.info('Would send certificate expiry email (Resend not configured)', {
          to,
          subject,
          certificate_type: certificateType,
          days_until_expiry: daysUntilExpiry,
        })
      }
    } catch (error: any) {
      logger.error('Failed to send certificate expiry email', {
        error: error.message,
        to: params.to,
      })
      throw error
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(params: { to: string; name: string }): Promise<void> {
    try {
      const { to, name } = params

      if (this.isConfigured && this.resend) {
        await this.resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'welcome@rightfitservices.co.uk',
          to,
          subject: 'Welcome to RightFit Services!',
          text: `Welcome ${name}! We're excited to have you on board.`,
          html: `
            <h1>Welcome to RightFit Services, ${name}!</h1>
            <p>We're excited to have you on board. Start managing your properties with ease.</p>
            <a href="https://app.rightfitservices.co.uk">Get Started</a>
          `,
        })
        logger.info('Welcome email sent', { to })
      } else {
        logger.info('Would send welcome email (Resend not configured)', { to })
      }
    } catch (error: any) {
      logger.error('Failed to send welcome email', {
        error: error.message,
        to: params.to,
      })
    }
  }
}

export default new EmailService()
