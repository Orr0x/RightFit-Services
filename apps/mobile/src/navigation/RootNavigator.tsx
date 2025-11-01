import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { RootStackParamList } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useThemeColors } from '../hooks/useThemeColors'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import MainTabNavigator from './MainTabNavigator'
import OfflineIndicator from '../components/OfflineIndicator'

const Stack = createStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth()
  const colors = useThemeColors()

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <>
      <OfflineIndicator />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </>
  )
}
