import twilio from 'twilio'
import logger from '../utils/logger'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client only if credentials are provided
let twilioClient: twilio.Twilio | null = null

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken)
  logger.info('Twilio client initialized')
} else {
  logger.warn('Twilio credentials not found - SMS notifications disabled')
}

export interface SendSmsParams {
  to: string
  message: string
  metadata?: Record<string, any>
}

class SmsService {
  async sendSms(params: SendSmsParams): Promise<boolean> {
    try {
      // If Twilio is not configured, log and return false
      if (!twilioClient || !fromNumber) {
        logger.warn('SMS not sent - Twilio not configured', {
          to: params.to,
          message: params.message,
        })
        return false
      }

      // Send SMS
      const message = await twilioClient.messages.create({
        body: params.message,
        from: fromNumber,
        to: params.to,
      })

      logger.info('SMS sent successfully', {
        sid: message.sid,
        to: params.to,
        status: message.status,
        metadata: params.metadata,
      })

      return true
    } catch (error: any) {
      logger.error('SMS send error', {
        error: error.message,
        to: params.to,
        code: error.code,
      })
      return false
    }
  }

  async sendWorkOrderAssignmentNotification(params: {
    contractorName: string
    contractorPhone: string
    workOrderTitle: string
    propertyAddress: string
    priority: string
    landlordName: string
    landlordPhone: string
  }): Promise<boolean> {
    const priorityText = params.priority === 'HIGH' ? 'URGENT: ' : ''
    const message = `${priorityText}New work order: ${params.workOrderTitle} at ${params.propertyAddress}. Contact ${params.landlordName}: ${params.landlordPhone}`

    return await this.sendSms({
      to: params.contractorPhone,
      message,
      metadata: {
        type: 'work_order_assignment',
        contractor: params.contractorName,
        work_order: params.workOrderTitle,
      },
    })
  }

  async sendWorkOrderUpdateNotification(params: {
    contractorPhone: string
    workOrderTitle: string
    propertyAddress: string
    updateType: string
    message: string
  }): Promise<boolean> {
    const smsMessage = `Update: ${params.workOrderTitle} at ${params.propertyAddress} - ${params.message}`

    return await this.sendSms({
      to: params.contractorPhone,
      message: smsMessage,
      metadata: {
        type: 'work_order_update',
        update_type: params.updateType,
        work_order: params.workOrderTitle,
      },
    })
  }

  isConfigured(): boolean {
    return twilioClient !== null && fromNumber !== undefined
  }
}

export default new SmsService()
