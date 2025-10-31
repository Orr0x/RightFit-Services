import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/contexts/AuthContext'
import { DatabaseProvider } from './src/database/DatabaseProvider'
import { NetworkProvider } from './src/contexts/NetworkContext'
import RootNavigator from './src/navigation/RootNavigator'
import ErrorBoundary from './src/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <NetworkProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </AuthProvider>
        </NetworkProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  )
}
