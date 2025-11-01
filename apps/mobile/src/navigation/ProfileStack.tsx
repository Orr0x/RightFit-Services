import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { ProfileStackParamList } from '../types'
import ProfileScreen from '../screens/profile/ProfileScreen'
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen'
import { getDefaultScreenOptions, getModalScreenOptions } from './screenOptions'
import { useThemeColors } from '../hooks/useThemeColors'

const Stack = createStackNavigator<ProfileStackParamList>()

export default function ProfileStack() {
  const colors = useThemeColors()
  const defaultScreenOptions = getDefaultScreenOptions(colors)
  const modalScreenOptions = getModalScreenOptions(colors)

  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password', ...modalScreenOptions }}
      />
    </Stack.Navigator>
  )
}
