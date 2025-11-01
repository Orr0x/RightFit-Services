import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { MainTabParamList } from '../types'
import { useThemeColors } from '../hooks/useThemeColors'
import PropertiesStack from './PropertiesStack'
import WorkOrdersStack from './WorkOrdersStack'
import CertificatesStack from './CertificatesStack'
import ContractorsStack from './ContractorsStack'
import ProfileStack from './ProfileStack'

const Tab = createBottomTabNavigator<MainTabParamList>()

export default function MainTabNavigator() {
  const colors = useThemeColors()

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Haptic feedback not available on this device
    })
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Properties"
        component={PropertiesStack}
        options={{
          tabBarLabel: 'Properties',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-city" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen
        name="WorkOrders"
        component={WorkOrdersStack}
        options={{
          tabBarLabel: 'Work Orders',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hammer-wrench" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen
        name="Certificates"
        component={CertificatesStack}
        options={{
          tabBarLabel: 'Certificates',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="certificate" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen
        name="Contractors"
        component={ContractorsStack}
        options={{
          tabBarLabel: 'Contractors',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-hard-hat" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tab.Navigator>
  )
}
