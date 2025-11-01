import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { WorkOrdersStackParamList } from '../types'
import WorkOrdersListScreen from '../screens/workOrders/WorkOrdersListScreen'
import WorkOrderDetailsScreen from '../screens/workOrders/WorkOrderDetailsScreen'
import CreateWorkOrderScreen from '../screens/workOrders/CreateWorkOrderScreen'
import { getDefaultScreenOptions, getModalScreenOptions } from './screenOptions'
import { useThemeColors } from '../hooks/useThemeColors'

const Stack = createStackNavigator<WorkOrdersStackParamList>()

export default function WorkOrdersStack() {
  const colors = useThemeColors()
  const defaultScreenOptions = getDefaultScreenOptions(colors)
  const modalScreenOptions = getModalScreenOptions(colors)

  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="WorkOrdersList"
        component={WorkOrdersListScreen}
        options={{ title: 'Work Orders' }}
      />
      <Stack.Screen
        name="WorkOrderDetails"
        component={WorkOrderDetailsScreen}
        options={{ title: 'Work Order Details' }}
      />
      <Stack.Screen
        name="CreateWorkOrder"
        component={CreateWorkOrderScreen}
        options={{ title: 'Create Work Order', ...modalScreenOptions }}
      />
    </Stack.Navigator>
  )
}
