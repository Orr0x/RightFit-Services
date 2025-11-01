import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native'
import { Input, Button, Spinner } from '../../components/ui'
import { spacing, typography } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { PropertiesStackParamList } from '../../types'
import api from '../../services/api'

type CreatePropertyScreenNavigationProp = StackNavigationProp<PropertiesStackParamList, 'CreateProperty'>
type CreatePropertyScreenRouteProp = RouteProp<PropertiesStackParamList, 'CreateProperty'>

interface Props {
  navigation: CreatePropertyScreenNavigationProp
  route: CreatePropertyScreenRouteProp
}

/**
 * CreatePropertyScreen - Screen for creating and editing properties
 * STORY-005: Dark Mode Support
 */
export default function CreatePropertyScreen({ navigation, route }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const propertyId = route.params?.propertyId
  const isEditMode = !!propertyId

  const [name, setName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingProperty, setFetchingProperty] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Property' : 'Add Property',
    })
  }, [navigation, isEditMode])

  useEffect(() => {
    if (isEditMode && propertyId) {
      loadProperty()
    }
  }, [isEditMode, propertyId])

  const loadProperty = async () => {
    try {
      setFetchingProperty(true)
      setError('')
      const property = await api.getProperty(propertyId!)
      setName(property.name)
      setAddressLine1(property.address_line1)
      setAddressLine2(property.address_line2 || '')
      setCity(property.city)
      setPostcode(property.postcode)
      setBedrooms(property.bedrooms.toString())
      setBathrooms(property.bathrooms.toString())
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load property')
    } finally {
      setFetchingProperty(false)
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!name || !addressLine1 || !city || !postcode || !bedrooms || !bathrooms) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const data = {
        name,
        address_line1: addressLine1,
        address_line2: addressLine2 || undefined,
        city,
        postcode,
        property_type: 'HOUSE',
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
      }

      if (isEditMode && propertyId) {
        await api.updateProperty(propertyId, data)
      } else {
        await api.createProperty(data)
      }

      navigation.goBack()
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} property`)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingProperty) {
    return (
      <View style={styles.container}>
        <Spinner centered size="lg" color={colors.primary} />
      </View>
    )
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
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {isEditMode ? 'Update Property' : 'Add Property'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
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
