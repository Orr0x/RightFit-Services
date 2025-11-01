import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { ContractorsStackParamList } from '../types'
import ContractorsListScreen from '../screens/contractors/ContractorsListScreen'
import ContractorDetailsScreen from '../screens/contractors/ContractorDetailsScreen'
import CreateContractorScreen from '../screens/contractors/CreateContractorScreen'
import { getDefaultScreenOptions, getModalScreenOptions } from './screenOptions'
import { useThemeColors } from '../hooks/useThemeColors'

const Stack = createStackNavigator<ContractorsStackParamList>()

export default function ContractorsStack() {
  const colors = useThemeColors()
  const defaultScreenOptions = getDefaultScreenOptions(colors)
  const modalScreenOptions = getModalScreenOptions(colors)

  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="ContractorsList"
        component={ContractorsListScreen}
        options={{ title: 'Contractors' }}
      />
      <Stack.Screen
        name="ContractorDetails"
        component={ContractorDetailsScreen}
        options={{ title: 'Contractor Details' }}
      />
      <Stack.Screen
        name="CreateContractor"
        component={CreateContractorScreen}
        options={{ title: 'Add Contractor', ...modalScreenOptions }}
      />
    </Stack.Navigator>
  )
}
