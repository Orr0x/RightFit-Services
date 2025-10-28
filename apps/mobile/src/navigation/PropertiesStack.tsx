import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { PropertiesStackParamList } from '../types'
import PropertiesListScreen from '../screens/properties/PropertiesListScreen'
import PropertyDetailsScreen from '../screens/properties/PropertyDetailsScreen'
import CreatePropertyScreen from '../screens/properties/CreatePropertyScreen'

const Stack = createStackNavigator<PropertiesStackParamList>()

export default function PropertiesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200EE',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
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
        options={{ title: 'Add Property' }}
      />
    </Stack.Navigator>
  )
}
