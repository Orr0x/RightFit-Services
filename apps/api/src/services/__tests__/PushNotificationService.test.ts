import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock Prisma Client
const mockDevice = {
  findMany: jest.fn(),
  upsert: jest.fn(),
  updateMany: jest.fn()
}

const mockNotification = {
  count: jest.fn().mockResolvedValue(0),
  create: jest.fn(),
  findMany: jest.fn()
}

jest.mock('@rightfit/database', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      device: mockDevice,
      notification: mockNotification
    })),
    NotificationType: {
      WORK_ORDER_ASSIGNED: 'WORK_ORDER_ASSIGNED',
      WORK_ORDER_STATUS_CHANGED: 'WORK_ORDER_STATUS_CHANGED',
      CERTIFICATE_EXPIRING: 'CERTIFICATE_EXPIRING'
    }
  }
})

// Import service after mocks are set up
import { PushNotificationService } from '../PushNotificationService'
import { NotificationType } from '@rightfit/database'

describe('PushNotificationService', () => {
  let pushService: PushNotificationService

  beforeEach(() => {
    jest.clearAllMocks()
    pushService = new PushNotificationService()
  })

  describe('registerDevice', () => {
    const deviceData = {
      userId: 'user-123',
      tenantId: 'tenant-123',
      pushToken: 'ExponentPushToken[abc123]',
      deviceId: 'device-456',
      platform: 'IOS' as const
    }

    it('should register a new device successfully', async () => {
      mockDevice.upsert.mockResolvedValue({
        id: 'device-uuid',
        user_id: deviceData.userId,
        tenant_id: deviceData.tenantId,
        push_token: deviceData.pushToken,
        device_id: deviceData.deviceId,
        platform: deviceData.platform,
        is_active: true,
        created_at: new Date()
      })

      await pushService.registerDevice(deviceData)

      expect(mockDevice.upsert).toHaveBeenCalledWith({
        where: {
          device_id_user_id: {
            device_id: deviceData.deviceId,
            user_id: deviceData.userId
          }
        },
        update: {
          push_token: deviceData.pushToken,
          platform: deviceData.platform,
          is_active: true
        },
        create: expect.objectContaining({
          user_id: deviceData.userId,
          tenant_id: deviceData.tenantId,
          push_token: deviceData.pushToken,
          device_id: deviceData.deviceId,
          platform: deviceData.platform
        })
      })
    })

    it('should handle device registration errors', async () => {
      mockDevice.upsert.mockRejectedValue(new Error('Database error'))

      await expect(pushService.registerDevice(deviceData)).rejects.toThrow()
    })
  })

  describe('unregisterDevice', () => {
    it('should unregister device successfully', async () => {
      mockDevice.updateMany.mockResolvedValue({ count: 1 })

      await pushService.unregisterDevice('device-123', 'user-123')

      expect(mockDevice.updateMany).toHaveBeenCalledWith({
        where: {
          device_id: 'device-123',
          user_id: 'user-123'
        },
        data: {
          is_active: false
        }
      })
    })

    it('should handle unregister errors', async () => {
      mockDevice.updateMany.mockRejectedValue(new Error('Database error'))

      await expect(
        pushService.unregisterDevice('device-123', 'user-123')
      ).rejects.toThrow()
    })
  })

  describe('sendNotification', () => {
    const notification = {
      userId: 'user-123',
      title: 'Test Notification',
      body: 'This is a test',
      data: { workOrderId: 'wo-123' },
      notificationType: 'WORK_ORDER_ASSIGNED' as NotificationType
    }

    beforeEach(() => {
      mockDevice.findMany.mockResolvedValue([
        {
          id: 'device-1',
          user_id: 'user-123',
          push_token: 'ExponentPushToken[abc123]',
          device_id: 'device-456',
          platform: 'IOS',
          is_active: true,
          created_at: new Date()
        }
      ])

      mockedAxios.post.mockResolvedValue({
        data: {
          data: [{ status: 'ok', id: 'notification-id' }]
        }
      })
    })

    it('should send push notification successfully', async () => {
      await pushService.sendNotification(notification)

      expect(mockDevice.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          is_active: true
        }
      })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.arrayContaining([
          expect.objectContaining({
            to: 'ExponentPushToken[abc123]',
            title: 'Test Notification',
            body: 'This is a test'
          })
        ]),
        expect.any(Object)
      )
    })

    it('should send to multiple devices for same user', async () => {
      mockDevice.findMany.mockResolvedValue([
        {
          id: 'device-1',
          user_id: 'user-123',
          push_token: 'ExponentPushToken[abc123]',
          device_id: 'device-456',
          platform: 'IOS',
          is_active: true,
          created_at: new Date()
        },
        {
          id: 'device-2',
          user_id: 'user-123',
          push_token: 'ExponentPushToken[def456]',
          device_id: 'device-789',
          platform: 'ANDROID',
          is_active: true,
          created_at: new Date()
        }
      ])

      await pushService.sendNotification(notification)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ to: 'ExponentPushToken[abc123]' }),
          expect.objectContaining({ to: 'ExponentPushToken[def456]' })
        ]),
        expect.any(Object)
      )
    })

    it('should handle user with no devices', async () => {
      mockDevice.findMany.mockResolvedValue([])

      await pushService.sendNotification(notification)

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })

    it('should handle Expo push API errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Expo API Error'))

      await expect(pushService.sendNotification(notification)).rejects.toThrow(
        'Expo API Error'
      )
    })
  })

  describe('sendBatchNotifications', () => {
    const notifications = [
      {
        userId: 'user-1',
        title: 'Test 1',
        body: 'Body 1',
        data: {},
        notificationType: 'WORK_ORDER_ASSIGNED' as NotificationType
      },
      {
        userId: 'user-2',
        title: 'Test 2',
        body: 'Body 2',
        data: {},
        notificationType: 'WORK_ORDER_STATUS_CHANGED' as NotificationType
      }
    ]

    it('should send notifications to multiple users', async () => {
      mockDevice.findMany
        .mockResolvedValueOnce([
          {
            id: 'device-1',
            user_id: 'user-1',
            push_token: 'ExponentPushToken[abc123]',
            device_id: 'device-456',
            platform: 'IOS',
            is_active: true,
            created_at: new Date()
          }
        ])
        .mockResolvedValueOnce([
          {
            id: 'device-2',
            user_id: 'user-2',
            push_token: 'ExponentPushToken[def456]',
            device_id: 'device-789',
            platform: 'ANDROID',
            is_active: true,
            created_at: new Date()
          }
        ])

      mockedAxios.post.mockResolvedValue({
        data: {
          data: [{ status: 'ok' }]
        }
      })

      await pushService.sendBatchNotifications(notifications)

      expect(mockDevice.findMany).toHaveBeenCalledTimes(2)
      expect(mockedAxios.post).toHaveBeenCalled()
    })
  })
})
