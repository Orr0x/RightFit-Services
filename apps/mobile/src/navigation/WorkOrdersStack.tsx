import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { WorkOrdersStackParamList } from '../types'
import WorkOrdersListScreen from '../screens/workOrders/WorkOrdersListScreen'
import WorkOrderDetailsScreen from '../screens/workOrders/WorkOrderDetailsScreen'
import CreateWorkOrderScreen from '../screens/workOrders/CreateWorkOrderScreen'

const Stack = createStackNavigator<WorkOrdersStackParamList>()

export default function WorkOrdersStack() {
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
        options={{ title: 'Create Work Order' }}
      />
    </Stack.Navigator>
  )
}
