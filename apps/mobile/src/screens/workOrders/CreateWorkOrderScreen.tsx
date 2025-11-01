import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Modal } from 'react-native'
import { Input, Button, Spinner } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { WorkOrdersStackParamList, Property } from '../../types'
import api from '../../services/api'
import offlineDataService from '../../services/offlineDataService'
import { useHaptics } from '../../hooks/useHaptics'

type CreateWorkOrderScreenNavigationProp = StackNavigationProp<WorkOrdersStackParamList, 'CreateWorkOrder'>
type CreateWorkOrderScreenRouteProp = RouteProp<WorkOrdersStackParamList, 'CreateWorkOrder'>

interface Props {
  navigation: CreateWorkOrderScreenNavigationProp
  route: CreateWorkOrderScreenRouteProp
}

/**
 * CreateWorkOrderScreen - Screen for creating work orders
 * STORY-005: Dark Mode Support
 */
export default function CreateWorkOrderScreen({ navigation, route }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const haptics = useHaptics()
  const workOrderId = route.params?.workOrderId
  const isEditMode = !!workOrderId

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [propertyId, setPropertyId] = useState(route.params?.propertyId || '')
  const [priority, setPriority] = useState('MEDIUM')
  const [category, setCategory] = useState('OTHER')
  const [dueDate, setDueDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingWorkOrder, setFetchingWorkOrder] = useState(false)
  const [error, setError] = useState('')
  const [propertyMenuVisible, setPropertyMenuVisible] = useState(false)
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false)
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Work Order' : 'Create Work Order',
    })
  }, [navigation, isEditMode])

  useEffect(() => {
    if (isEditMode && workOrderId) {
      loadWorkOrder()
    }
  }, [isEditMode, workOrderId])

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

  const loadWorkOrder = async () => {
    try {
      setFetchingWorkOrder(true)
      setError('')
      const workOrder = await api.getWorkOrder(workOrderId!)
      setTitle(workOrder.title)
      setDescription(workOrder.description)
      setPropertyId(workOrder.property_id || '')
      setPriority(workOrder.priority || 'MEDIUM')
      setCategory(workOrder.category || 'OTHER')
      if (workOrder.due_date) {
        // Format date for display in input field
        const date = new Date(workOrder.due_date)
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
        setDueDate(formattedDate)
      }
      if (workOrder.estimated_cost != null) {
        setEstimatedCost(workOrder.estimated_cost.toString())
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load work order')
      haptics.error()
    } finally {
      setFetchingWorkOrder(false)
    }
  }

  const handleCreate = async () => {
    setError('')

    if (!title || !description || !propertyId) {
      setError('Please fill in all required fields')
      haptics.error()
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

      if (isEditMode && workOrderId) {
        // Update existing work order
        await api.updateWorkOrder(workOrderId, workOrderData)
      } else {
        // Use offline-aware service for work order creation
        await offlineDataService.createWorkOrder(workOrderData)
      }

      haptics.success()
      navigation.goBack()
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} work order`)
      haptics.error()
    } finally {
      setLoading(false)
    }
  }

  const selectedProperty = properties.find((p) => p.id === propertyId)

  if (fetchingWorkOrder) {
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
            {isEditMode ? 'Update Work Order' : 'Create Work Order'}
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
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  dropdownPlaceholder: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
  },
  dropdownIcon: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
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
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      paddingTop: spacing.lg,
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
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
      borderBottomColor: colors.neutral200,
    },
    modalItemText: {
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
  })
