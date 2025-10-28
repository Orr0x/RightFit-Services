# RightFit Services Mobile App

React Native mobile application for RightFit Services property management platform, built with Expo.

## Features

- User authentication (Login/Register)
- Property management (List, View, Create)
- Work order management (List, View, Create)
- Multi-tenant support
- Offline token storage with AsyncStorage
- Automatic token refresh on 401 responses

## Tech Stack

- **React Native** with **Expo** - Cross-platform mobile framework
- **React Navigation** - Navigation library (Stack + Bottom Tabs)
- **React Native Paper** - Material Design UI components
- **TypeScript** - Type safety
- **Axios** - HTTP client for API calls
- **AsyncStorage** - Persistent storage for auth tokens

## Prerequisites

- Node.js 18+ and pnpm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (iOS/Android)
- Or iOS Simulator / Android Emulator

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Update API base URL:
   - Open `src/services/api.ts`
   - Change `API_BASE_URL` to your local IP address (not localhost) for physical devices
   - Example: `const API_BASE_URL = 'http://192.168.1.100:3001'`

## Running the App

1. Start the Expo development server:
```bash
pnpm start
```

2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

Or press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web (limited functionality)

## Project Structure

```
apps/mobile/
├── src/
│   ├── navigation/          # Navigation configuration
│   │   ├── RootNavigator.tsx       # Root stack (auth flow)
│   │   ├── MainTabNavigator.tsx    # Bottom tabs
│   │   ├── PropertiesStack.tsx     # Properties section
│   │   └── WorkOrdersStack.tsx     # Work orders section
│   ├── screens/
│   │   ├── auth/            # Login, Register
│   │   ├── properties/      # Properties list, details, create
│   │   ├── workOrders/      # Work orders list, details, create
│   │   └── profile/         # Profile and settings
│   ├── services/
│   │   └── api.ts           # API client with auth
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── components/          # Reusable components
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
└── package.json
```

## API Configuration

The app connects to the RightFit Services API. Make sure the API server is running:

```bash
# In the root directory
cd apps/api
pnpm dev
```

API runs on `http://localhost:3001` by default.

### Using on Physical Device

When testing on a physical device, you need to use your computer's local IP address instead of `localhost`:

1. Find your local IP:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **Mac/Linux**: `ifconfig` or `ip addr`

2. Update `API_BASE_URL` in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:3001' // Replace with your IP
   ```

## Authentication Flow

The app uses JWT-based authentication:

1. User logs in or registers
2. API returns access token + refresh token
3. Tokens stored in AsyncStorage
4. Access token sent with every API request
5. On 401 response, automatically refreshes token
6. On refresh failure, redirects to login

## Available Scripts

- `pnpm start` - Start Expo development server
- `pnpm android` - Run on Android emulator/device
- `pnpm ios` - Run on iOS simulator/device
- `pnpm web` - Run in web browser (limited functionality)

## Next Steps

- [ ] Implement auth state management with Context/Redux
- [ ] Add photo upload with camera integration
- [ ] Add offline support with local storage
- [ ] Implement push notifications for work order updates
- [ ] Add certificate expiry notifications
- [ ] Implement biometric authentication
- [ ] Add dark mode support

## Troubleshooting

### Cannot connect to API
- Ensure API server is running
- Check `API_BASE_URL` uses your local IP (not localhost) for physical devices
- Ensure phone and computer are on same WiFi network

### Module resolution errors
```bash
# Clear Metro bundler cache
pnpm start --clear
```

### Dependency issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

## License

Proprietary - RightFit Services
