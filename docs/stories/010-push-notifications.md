# Story 010: Push Notifications

**Epic:** Communication & Notifications
**Priority:** MEDIUM
**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 13
**Status:** To Do

---

## User Story

**As a** landlord
**I want to** receive push notifications for important events (certificate expiry, work order updates, photo quality alerts)
**So that** I stay informed without constantly checking the app

---

## Acceptance Criteria

### AC-10.1: Push Notification Setup (Mobile)
- **App requests** permissions on first launch or after login:
  - Use expo-notifications module
  - iOS: Native permission prompt
  - Android: Granted by default on Android 12 and below, request on Android 13+
- **If denied:**
  - Store preference in AsyncStorage
  - Show message: "Enable notifications in Settings to receive alerts"
  - Allow re-enable in app Settings
- **On granted:**
  - Register with Expo Push Notification service
  - Obtain Expo Push Token (e.g., "ExponentPushToken[xxxx]")
  - Submit to `POST /api/devices/register`:
    ```javascript
    {
      push_token: 'ExponentPushToken[...]',
      device_id: 'unique-device-id',
      platform: 'ios' | 'android',
      user_id: 'uuid',
      tenant_id: 'uuid'
    }
    ```
  - API stores in devices table

### AC-10.2: Notification Triggers
- **System sends** push notifications for:
  1. **Certificate expiring** (30d, 7d, 0d, 7d overdue) - See Story 006
  2. **Photo quality alert** (AI score <50) - See Story 004
  3. **Subscription ending** (trial ending, payment failed) - See Story 008
  4. **Work order assigned** (team member assigns to you) - Post-MVP
  5. **System announcements** (maintenance, new features) - Post-MVP

### AC-10.3: Send Push Notification (API)
- **Given** notification trigger event
- **When** API sends push notification
- **Then** execute:
  1. Query devices table: `SELECT push_token FROM devices WHERE user_id = ? AND tenant_id = ?`
  2. Construct Expo payload:
     ```javascript
     {
       to: push_token,
       sound: 'default',
       title: 'Certificate Expiring Soon',
       body: 'Your Gas Safe certificate for 123 Main St expires in 7 days!',
       data: {
         type: 'CERTIFICATE_EXPIRY',
         certificate_id: 'uuid',
         property_id: 'uuid',
         deep_link: 'rightfit://properties/uuid/compliance'
       },
       badge: 1, // Increment badge count
       priority: 'high'
     }
     ```
  3. POST to Expo API: `https://exp.host/--/api/v2/push/send`
  4. Log to database:
     ```prisma
     {
       user_id,
       tenant_id,
       notification_type: 'CERTIFICATE_EXPIRY',
       title,
       body,
       data: json,
       sent_at,
       read_at: null
     }
     ```
  5. Handle response:
     - Success: Log success
     - Error (invalid token): Mark device as inactive

### AC-10.4: Notification Inbox (In-App)
- **App displays** Notifications screen (main tab, bell icon with unread badge)
- **When** user opens screen
- **Then** display FlatList of NotificationCard:
  - title (Text, fontSize: 16, fontWeight: '500')
  - body (Text, fontSize: 14, max 2 lines, ellipsis)
  - timestamp (Text, fontSize: 12, relative: "2 hours ago")
  - Read/unread indicator (blue dot for unread)
  - Type icon (certificate, camera, clipboard, etc.)
  - Sort by sent_at DESC
  - Unread: light blue background
- **When** user taps NotificationCard
- **Then**:
  - Mark as read: `PATCH /api/notifications/:id/read` (set read_at)
  - Remove blue dot, change background to white
  - Navigate to deep_link destination

### AC-10.5: Deep Linking
- **App handles** deep links from notifications:
  - `rightfit://properties/:id` → Property Detail
  - `rightfit://properties/:id/compliance` → Property Detail → Compliance tab
  - `rightfit://work-orders/:id` → Work Order Detail
  - `rightfit://settings/subscription` → Subscription screen
- **Use** React Navigation Linking configuration
- **Configure** URL scheme in app.json: `"scheme": "rightfit"`

### AC-10.6: Notification Preferences
- **Settings screen** includes "Notification Preferences" with toggles:
  - "Certificate expiry reminders" (default: ON)
  - "Photo quality alerts" (default: ON)
  - "Work order updates" (default: ON)
  - "Subscription & billing alerts" (default: ON, cannot disable)
  - "Marketing & product updates" (default: OFF)
- **When** user toggles:
  - Submit to `PATCH /api/users/:id/notification-preferences`
  - Store in user_notification_preferences table
- **API checks** preferences before sending (except critical billing)

### AC-10.7: Badge Count Management
- **App displays** badge count on Notifications tab icon (unread count)
- **Update when:**
  - New notification received: +1
  - User reads notification: -1
  - User marks all as read: 0
- **Use** expo-notifications.setBadgeCountAsync()

### AC-10.8: Mark All as Read
- **Notifications screen** has "Mark All as Read" button (top-right)
- **When** user taps
- **Then** submit to `POST /api/notifications/mark-all-read`
- **And** API: `UPDATE notifications SET read_at = NOW() WHERE user_id = ?`
- **And** app refreshes list (all blue dots removed)
- **And** badge count = 0

### AC-10.9: Background Notification Handling
- **App handles** notifications in different states:
  - **Foreground:** Display in-app SnackBar + add to inbox
  - **Background:** Show native notification + add to inbox
  - **Closed:** Show native notification + add to inbox (loaded on next open)
- **Use** expo-notifications listeners:
  - `addNotificationReceivedListener`: Foreground
  - `addNotificationResponseReceivedListener`: User tapped (navigate to deep_link)

---

## Edge Cases

- **User receives notification while offline**
  - Expected: OS delivers when device online, appears in system tray

- **User has app open when notification arrives**
  - Expected: In-app SnackBar, no system notification (avoid duplication)

- **User denies notification permissions**
  - Expected: Notifications still in in-app inbox, no push notifications

- **User uninstalls app, device record remains**
  - Expected: Expo returns "DeviceNotRegistered", mark device inactive

- **User receives 50 notifications while away**
  - Expected: All queued, delivered when device connects, badge shows 50

---

## Technical Implementation Notes

### Database Models
```prisma
model Device {
  id                String    @id @default(uuid())
  user_id           String
  tenant_id         String
  push_token        String    @db.VarChar(255)
  device_id         String    @db.VarChar(255)
  platform          DevicePlatform
  is_active         Boolean   @default(true)
  registered_at     DateTime  @default(now())

  user              User      @relation(fields: [user_id], references: [id])

  @@unique([device_id, user_id])
  @@index([user_id])
}

model Notification {
  id                String    @id @default(uuid())
  user_id           String
  tenant_id         String
  notification_type NotificationType
  title             String    @db.VarChar(255)
  body              String    @db.Text
  data              Json?
  sent_at           DateTime  @default(now())
  read_at           DateTime?

  user              User      @relation(fields: [user_id], references: [id])

  @@index([user_id, read_at])
  @@index([tenant_id])
}

enum DevicePlatform {
  IOS
  ANDROID
}

enum NotificationType {
  CERTIFICATE_EXPIRY
  PHOTO_QUALITY
  WORK_ORDER_ASSIGNED
  SUBSCRIPTION_ENDING
  PAYMENT_FAILED
  SYSTEM_ANNOUNCEMENT
}
```

### Push Notification Service
```javascript
// apps/api/src/services/pushNotificationService.js
const axios = require('axios')

async function sendPushNotification(userId, title, body, data) {
  // Get user's devices
  const devices = await prisma.device.findMany({
    where: { user_id: userId, is_active: true }
  })

  // Check user preferences
  const preferences = await getUserNotificationPreferences(userId)
  if (!preferences[data.type]) {
    return // User has disabled this notification type
  }

  // Construct Expo push message
  const messages = devices.map(device => ({
    to: device.push_token,
    sound: 'default',
    title,
    body,
    data,
    badge: await getUnreadCount(userId) + 1,
    priority: data.priority || 'default'
  }))

  // Send to Expo
  const response = await axios.post(
    'https://exp.host/--/api/v2/push/send',
    messages
  )

  // Log notification
  await prisma.notification.create({
    data: {
      user_id: userId,
      tenant_id: data.tenant_id,
      notification_type: data.type,
      title,
      body,
      data
    }
  })

  // Handle errors
  response.data.data.forEach((result, index) => {
    if (result.status === 'error') {
      if (result.details?.error === 'DeviceNotRegistered') {
        // Mark device as inactive
        prisma.device.update({
          where: { id: devices[index].id },
          data: { is_active: false }
        })
      }
    }
  })
}
```

### Mobile Setup (React Native)
```typescript
// apps/mobile/src/services/notificationService.ts
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    return null // Simulators don't support push
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null // User denied
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data

  // Register with backend
  await api.post('/api/devices/register', {
    push_token: token,
    device_id: Device.osInternalBuildId,
    platform: Device.osName === 'iOS' ? 'ios' : 'android'
  })

  return token
}

// Foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
})

// Listen for notifications
Notifications.addNotificationReceivedListener(notification => {
  // Handle foreground notification (show in-app SnackBar)
  showInAppNotification(notification.request.content)
})

Notifications.addNotificationResponseReceivedListener(response => {
  // User tapped notification
  const data = response.notification.request.content.data
  navigateToDeepLink(data.deep_link)
})
```

### Deep Linking Configuration
```javascript
// apps/mobile/app.json
{
  "expo": {
    "scheme": "rightfit",
    "ios": {
      "bundleIdentifier": "com.rightfitservices.app",
      "associatedDomains": ["applinks:app.rightfitservices.com"]
    },
    "android": {
      "package": "com.rightfitservices.app",
      "intentFilters": [{
        "action": "VIEW",
        "data": [{ "scheme": "rightfit" }]
      }]
    }
  }
}
```

```typescript
// apps/mobile/src/navigation/linking.ts
export const linking = {
  prefixes: ['rightfit://', 'https://app.rightfitservices.com'],
  config: {
    screens: {
      PropertyDetail: 'properties/:id',
      WorkOrderDetail: 'work-orders/:id',
      Settings: 'settings',
      Subscription: 'settings/subscription'
    }
  }
}
```

---

## Testing Checklist

- [ ] Request permissions on first launch → Prompt shown
- [ ] Grant permissions → Expo push token obtained and registered
- [ ] Deny permissions → In-app message shown, no push notifications
- [ ] Send test notification → Received on device
- [ ] Notification appears in system tray (app closed)
- [ ] Tap notification → App opens to correct screen (deep link)
- [ ] Notification appears in in-app inbox
- [ ] Tap inbox notification → Marks as read, navigates
- [ ] Badge count updates correctly (+1 new, -1 read)
- [ ] Mark all as read → All blue dots removed, badge = 0
- [ ] Toggle notification preference OFF → No notifications sent for that type
- [ ] Foreground notification → In-app SnackBar shown
- [ ] Multiple devices registered → All receive notification
- [ ] Device unregistered → Marked inactive, no more notifications

---

## Dependencies

- **Related:** UK Compliance Tracking (Story 006) - for expiry notifications
- **Related:** Photo Management (Story 004) - for quality alerts
- **Related:** Payment Processing (Story 008) - for billing notifications
- **Requires:**
  - `expo-notifications`
  - `expo-device`
  - Expo Push Notification service

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Push notification permissions requested
- [ ] Expo push token registration working
- [ ] Send push notification API endpoint
- [ ] In-app notification inbox
- [ ] Deep linking configured and working
- [ ] Notification preferences UI
- [ ] Badge count management
- [ ] Mark all as read functionality
- [ ] Foreground/background/closed handlers
- [ ] Unit tests for notification service
- [ ] Integration tests with Expo
- [ ] Manual testing on iOS and Android devices
- [ ] Code reviewed
- [ ] Deployed to dev environment
