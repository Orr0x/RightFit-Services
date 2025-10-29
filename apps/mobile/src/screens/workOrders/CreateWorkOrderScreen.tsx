import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { TextInput, Button, HelperText, Menu } from 'react-native-paper'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { WorkOrdersStackParamList, Property } from '../../types'
import api from '../../services/api'
import offlineDataService from '../../services/offlineDataService'

type CreateWorkOrderScreenNavigationProp = StackNavigationProp<WorkOrdersStackParamList, 'CreateWorkOrder'>
type CreateWorkOrderScreenRouteProp = RouteProp<WorkOrdersStackParamList, 'CreateWorkOrder'>

interface Props {
  navigation: CreateWorkOrderScreenNavigationProp
  route: CreateWorkOrderScreenRouteProp
}

export default function CreateWorkOrderScreen({ navigation, route }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [propertyId, setPropertyId] = useState(route.params?.propertyId || '')
  const [priority, setPriority] = useState('MEDIUM')
  const [category, setCategory] = useState('OTHER')
  const [dueDate, setDueDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [propertyMenuVisible, setPropertyMenuVisible] = useState(false)
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false)
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Try to fetch from API first
        const data = await api.getProperties()
        setProperties(data)
      } catch (error) {
        console.error('Failed to fetch properties from API:', error)
        // Fall back to local database in offline mode
        try {
          const localData = await offlineDataService.getLocalProperties()
          setProperties(localData)
        } catch (localError) {
          console.error('Failed to fetch local properties:', localError)
        }
      }
    }
    fetchProperties()
  }, [])

  const handleCreate = async () => {
    setError('')

    if (!title || !description || !propertyId) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const workOrderData: any = {
        title,
        description,
        property_id: propertyId,
        priority,
        category,
        status: 'OPEN',
      }

      // Add optional fields if provided
      if (dueDate) {
        workOrderData.due_date = new Date(dueDate).toISOString()
      }
      if (estimatedCost) {
        workOrderData.estimated_cost = parseFloat(estimatedCost)
      }

      await api.createWorkOrder(workOrderData)
      navigation.goBack()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create work order')
    } finally {
      setLoading(false)
    }
  }

  const selectedProperty = properties.find((p) => p.id === propertyId)

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TextInput
            label="Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description *"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Menu
            visible={propertyMenuVisible}
            onDismiss={() => setPropertyMenuVisible(false)}
            anchor={
              <TextInput
                label="Property *"
                value={selectedProperty?.name || ''}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="chevron-down" onPress={() => setPropertyMenuVisible(true)} />}
                onPressIn={() => setPropertyMenuVisible(true)}
                style={styles.input}
              />
            }
          >
            {properties.map((property) => (
              <Menu.Item
                key={property.id}
                onPress={() => {
                  setPropertyId(property.id)
                  setPropertyMenuVisible(false)
                }}
                title={property.name}
              />
            ))}
          </Menu>

          <Menu
            visible={priorityMenuVisible}
            onDismiss={() => setPriorityMenuVisible(false)}
            anchor={
              <TextInput
                label="Priority"
                value={priority}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="chevron-down" onPress={() => setPriorityMenuVisible(true)} />}
                onPressIn={() => setPriorityMenuVisible(true)}
                style={styles.input}
              />
            }
          >
            {['EMERGENCY', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <Menu.Item
                key={p}
                onPress={() => {
                  setPriority(p)
                  setPriorityMenuVisible(false)
                }}
                title={p}
              />
            ))}
          </Menu>

          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <TextInput
                label="Category"
                value={category}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="chevron-down" onPress={() => setCategoryMenuVisible(true)} />}
                onPressIn={() => setCategoryMenuVisible(true)}
                style={styles.input}
              />
            }
          >
            {['PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'EXTERIOR', 'INTERIOR', 'OTHER'].map((c) => (
              <Menu.Item
                key={c}
                onPress={() => {
                  setCategory(c)
                  setCategoryMenuVisible(false)
                }}
                title={c}
              />
            ))}
          </Menu>

          <TextInput
            label="Due Date & Time (YYYY-MM-DD HH:MM)"
            value={dueDate}
            onChangeText={setDueDate}
            mode="outlined"
            placeholder="2025-01-15 14:30"
            style={styles.input}
          />

          <TextInput
            label="Estimated Cost (£)"
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            mode="outlined"
            keyboardType="decimal-pad"
            placeholder="0.00"
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
            Create Work Order
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
