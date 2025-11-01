import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { CertificatesStackParamList } from '../types'
import CertificatesListScreen from '../screens/certificates/CertificatesListScreen'
import CertificateDetailsScreen from '../screens/certificates/CertificateDetailsScreen'
import CreateCertificateScreen from '../screens/certificates/CreateCertificateScreen'
import { getDefaultScreenOptions, getModalScreenOptions } from './screenOptions'
import { useThemeColors } from '../hooks/useThemeColors'

const Stack = createStackNavigator<CertificatesStackParamList>()

export default function CertificatesStack() {
  const colors = useThemeColors()
  const defaultScreenOptions = getDefaultScreenOptions(colors)
  const modalScreenOptions = getModalScreenOptions(colors)

  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="CertificatesList"
        component={CertificatesListScreen}
        options={{ title: 'Certificates' }}
      />
      <Stack.Screen
        name="CertificateDetails"
        component={CertificateDetailsScreen}
        options={{ title: 'Certificate Details' }}
      />
      <Stack.Screen
        name="CreateCertificate"
        component={CreateCertificateScreen}
        options={{ title: 'Add Certificate', ...modalScreenOptions }}
      />
    </Stack.Navigator>
  )
}
