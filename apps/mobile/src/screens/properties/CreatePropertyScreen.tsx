import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { TextInput, Button, HelperText } from 'react-native-paper'
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
          <TextInput
            label="Property Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Address Line 1 *"
            value={addressLine1}
            onChangeText={setAddressLine1}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Address Line 2"
            value={addressLine2}
            onChangeText={setAddressLine2}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="City *"
            value={city}
            onChangeText={setCity}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Postcode *"
            value={postcode}
            onChangeText={setPostcode}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Bedrooms *"
            value={bedrooms}
            onChangeText={setBedrooms}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Bathrooms *"
            value={bathrooms}
            onChangeText={setBathrooms}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
})
