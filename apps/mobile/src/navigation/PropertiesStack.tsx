import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { PropertiesStackParamList } from '../types'
import PropertiesListScreen from '../screens/properties/PropertiesListScreen'
import PropertyDetailsScreen from '../screens/properties/PropertyDetailsScreen'
import CreatePropertyScreen from '../screens/properties/CreatePropertyScreen'
import { getDefaultScreenOptions, getModalScreenOptions } from './screenOptions'
import { useThemeColors } from '../hooks/useThemeColors'

const Stack = createStackNavigator<PropertiesStackParamList>()

export default function PropertiesStack() {
  const colors = useThemeColors()
  const defaultScreenOptions = getDefaultScreenOptions(colors)
  const modalScreenOptions = getModalScreenOptions(colors)

  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="PropertiesList"
        component={PropertiesListScreen}
        options={{ title: 'Properties' }}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{ title: 'Property Details' }}
      />
      <Stack.Screen
        name="CreateProperty"
        component={CreatePropertyScreen}
        options={{ title: 'Add Property', ...modalScreenOptions }}
      />
    </Stack.Navigator>
  )
}
