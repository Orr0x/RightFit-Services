import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native'
import { Input, Button } from '../../components/ui'
import { colors, spacing, typography } from '../../styles/tokens'
import { StackNavigationProp } from '@react-navigation/stack'
import { PropertiesStackParamList } from '../../types'
import api from '../../services/api'

type CreatePropertyScreenNavigationProp = StackNavigationProp<PropertiesStackParamList, 'CreateProperty'>

interface Props {
  navigation: CreatePropertyScreenNavigationProp
}

export default function CreatePropertyScreen({ navigation }: Props) {
  const [name, setName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')

    if (!name || !addressLine1 || !city || !postcode || !bedrooms || !bathrooms) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      await api.createProperty({
        name,
        address_line1: addressLine1,
        address_line2: addressLine2 || undefined,
        city,
        postcode,
        property_type: 'HOUSE',
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
      })
      navigation.goBack()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Input
            label="Property Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., 123 Main Street"
            required
            style={styles.input}
          />

          <Input
            label="Address Line 1"
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Street address"
            required
            style={styles.input}
          />

          <Input
            label="Address Line 2"
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Apartment, suite, etc. (optional)"
            style={styles.input}
          />

          <Input
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="City"
            required
            style={styles.input}
          />

          <Input
            label="Postcode"
            value={postcode}
            onChangeText={setPostcode}
            placeholder="SW1A 1AA"
            required
            style={styles.input}
          />

          <Input
            label="Bedrooms"
            value={bedrooms}
            onChangeText={setBedrooms}
            placeholder="Number of bedrooms"
            keyboardType="numeric"
            required
            style={styles.input}
          />

          <Input
            label="Bathrooms"
            value={bathrooms}
            onChangeText={setBathrooms}
            placeholder="Number of bathrooms"
            keyboardType="numeric"
            required
            style={styles.input}
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            variant="primary"
            size="lg"
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Create Property
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
  },
})
