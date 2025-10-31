import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Modal } from 'react-native'
import { Input, Button } from '../../components/ui'
import { colors, spacing, typography, borderRadius } from '../../styles/tokens'
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
        // Check if online first
        const isOnline = await offlineDataService.isOnline()

        if (isOnline) {
          try {
            // Fetch from API when online
            const data = await api.getProperties()
            setProperties(data)
          } catch (error) {
            console.error('Failed to fetch properties from API:', error)
            // Fall back to local database if API fails
            const localData = await offlineDataService.getLocalProperties()
            setProperties(localData)
          }
        } else {
          // Offline: load from local database
          console.log('Device offline, loading properties from local database')
          const localData = await offlineDataService.getLocalProperties()
          setProperties(localData)
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error)
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

      // Use offline-aware service for work order creation
      await offlineDataService.createWorkOrder(workOrderData)
      navigation.goBack()
    } catch (err: any) {
      setError(err.message || 'Failed to create work order')
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
          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter work order title"
            required
            style={styles.input}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the work order"
            multiline
            numberOfLines={4}
            required
            style={styles.input}
          />

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Property *</Text>
            <TouchableOpacity
              onPress={() => setPropertyMenuVisible(true)}
              style={styles.dropdown}
            >
              <Text style={selectedProperty ? styles.dropdownText : styles.dropdownPlaceholder}>
                {selectedProperty?.name || 'Select property'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Priority</Text>
            <TouchableOpacity
              onPress={() => setPriorityMenuVisible(true)}
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>{priority}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              onPress={() => setCategoryMenuVisible(true)}
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>{category}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Due Date & Time (YYYY-MM-DD HH:MM)"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="2025-01-15 14:30"
            style={styles.input}
          />

          <Input
            label="Estimated Cost (£)"
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            placeholder="0.00"
            keyboardType="decimal-pad"
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
            Create Work Order
          </Button>
        </View>
      </ScrollView>

      {/* Property Selection Modal */}
      <Modal
        visible={propertyMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPropertyMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPropertyMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Property</Text>
            <ScrollView style={styles.modalList}>
              {properties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setPropertyId(property.id)
                    setPropertyMenuVisible(false)
                  }}
                >
                  <Text style={styles.modalItemText}>{property.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Priority Selection Modal */}
      <Modal
        visible={priorityMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPriorityMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPriorityMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Priority</Text>
            <ScrollView style={styles.modalList}>
              {['HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.modalItem}
                  onPress={() => {
                    setPriority(p)
                    setPriorityMenuVisible(false)
                  }}
                >
                  <Text style={styles.modalItemText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.modalList}>
              {['PLUMBING', 'ELECTRICAL', 'HEATING', 'APPLIANCES', 'EXTERIOR', 'INTERIOR', 'OTHER'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(c)
                    setCategoryMenuVisible(false)
                  }}
                >
                  <Text style={styles.modalItemText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  dropdownPlaceholder: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
  },
  dropdownIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingTop: spacing.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalList: {
    paddingHorizontal: spacing.lg,
  },
  modalItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalItemText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
})
