import { EmailService } from '../EmailService'
import { Resend } from 'resend'

// Mock Resend
jest.mock('resend')

describe('EmailService', () => {
  let emailService: EmailService
  let mockResendInstance: any

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Create mock Resend instance
    mockResendInstance = {
      emails: {
        send: jest.fn().mockResolvedValue({ id: 'test-email-id' })
      }
    }

    // Mock Resend constructor
    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () => mockResendInstance
    )

    // Set env vars
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.RESEND_FROM_EMAIL = 'test@example.com'

    emailService = new EmailService()
  })

  afterEach(() => {
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM_EMAIL
  })

  describe('constructor', () => {
    it('should initialize with valid API key', () => {
      expect(Resend).toHaveBeenCalledWith('test-api-key')
    })

    it('should not initialize without API key', () => {
      delete process.env.RESEND_API_KEY
      jest.clearAllMocks()

      new EmailService()
      expect(Resend).not.toHaveBeenCalled()
    })
  })

  describe('sendCertificateExpiryEmail', () => {
    const baseParams = {
      to: 'landlord@example.com',
      ownerName: 'John Doe',
      certificateType: 'Gas Safety Certificate',
      propertyName: '123 Main St, London',
      expiryDate: new Date('2025-12-01'),
      daysUntilExpiry: 30
    }

    it('should send email successfully for 60 days warning', async () => {
      const params = { ...baseParams, daysUntilExpiry: 60 }

      await emailService.sendCertificateExpiryEmail(params)

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          to: 'landlord@example.com',
          subject: expect.stringContaining('Certificate Renewal Reminder'),
          html: expect.stringContaining('Gas Safety Certificate')
        })
      )
    })

    it('should send email with correct urgency for 30 days', async () => {
      const params = { ...baseParams, daysUntilExpiry: 30 }

      await emailService.sendCertificateExpiryEmail(params)

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('EXPIRING SOON')
        })
      )
    })

    it('should send email with correct urgency for 7 days', async () => {
      const params = { ...baseParams, daysUntilExpiry: 7 }

      await emailService.sendCertificateExpiryEmail(params)

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('URGENT')
        })
      )
    })

    it('should send email for expired certificate', async () => {
      const params = { ...baseParams, daysUntilExpiry: -5 }

      await emailService.sendCertificateExpiryEmail(params)

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('EXPIRED')
        })
      )
    })

    it('should include certificate details in email', async () => {
      await emailService.sendCertificateExpiryEmail(baseParams)

      const call = mockResendInstance.emails.send.mock.calls[0][0]
      expect(call.html).toContain('Gas Safety Certificate')
      expect(call.html).toContain('123 Main St, London')
      expect(call.html).toContain('John Doe')
    })

    it('should not send email when service is not configured', async () => {
      delete process.env.RESEND_API_KEY
      const unconfiguredService = new EmailService()

      await unconfiguredService.sendCertificateExpiryEmail(baseParams)

      expect(mockResendInstance.emails.send).not.toHaveBeenCalled()
    })

    it('should handle Resend API errors gracefully', async () => {
      mockResendInstance.emails.send.mockRejectedValue(
        new Error('Resend API Error')
      )

      await expect(
        emailService.sendCertificateExpiryEmail(baseParams)
      ).rejects.toThrow('Resend API Error')
    })

    it('should format date correctly in email', async () => {
      await emailService.sendCertificateExpiryEmail(baseParams)

      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('1 December 2025')
        })
      )
    })

    it('should handle missing optional certificate number', async () => {
      const paramsWithoutNumber = { ...baseParams, certificateNumber: undefined }

      await emailService.sendCertificateExpiryEmail(paramsWithoutNumber)

      expect(mockResendInstance.emails.send).toHaveBeenCalled()
    })

    it('should use correct colors for urgency levels', async () => {
      // 60 days - green
      await emailService.sendCertificateExpiryEmail({
        ...baseParams,
        daysUntilExpiry: 60
      })
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('#4CAF50') // Material Design Green
        })
      )

      jest.clearAllMocks()

      // 30 days - orange
      await emailService.sendCertificateExpiryEmail({
        ...baseParams,
        daysUntilExpiry: 30
      })
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('#FF9800') // Material Design Orange
        })
      )

      jest.clearAllMocks()

      // 7 days - red
      await emailService.sendCertificateExpiryEmail({
        ...baseParams,
        daysUntilExpiry: 7
      })
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('#F44336') // Material Design Red
        })
      )
    })
  })

  describe('configuration', () => {
    it('should initialize with API key', () => {
      new EmailService()
      expect(Resend).toHaveBeenCalledWith('test-api-key')
    })

    it('should handle missing API key gracefully', () => {
      delete process.env.RESEND_API_KEY
      jest.clearAllMocks()

      new EmailService()
      expect(Resend).not.toHaveBeenCalled()
    })
  })
})
