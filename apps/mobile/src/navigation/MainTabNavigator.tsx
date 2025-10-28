import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { MainTabParamList } from '../types'
import PropertiesStack from './PropertiesStack'
import WorkOrdersStack from './WorkOrdersStack'
import ProfileScreen from '../screens/profile/ProfileScreen'

const Tab = createBottomTabNavigator<MainTabParamList>()

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
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
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
