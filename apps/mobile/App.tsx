import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { AuthProvider } from './src/contexts/AuthContext'
import { DatabaseProvider } from './src/database/DatabaseProvider'
import { NetworkProvider } from './src/contexts/NetworkContext'
import { ThemeProvider } from './src/contexts/ThemeContext'
import { OfflineIndicator } from './src/components/ui'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <DatabaseProvider>
      <NetworkProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <View style={{ flex: 1 }}>
                <OfflineIndicator />
                <RootNavigator />
                <StatusBar style="auto" />
              </View>
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </NetworkProvider>
    </DatabaseProvider>
  )
}
