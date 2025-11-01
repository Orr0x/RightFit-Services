import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  Switch
} from 'react-native'
import { Input, Button, Spinner } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { ContractorsStackParamList, ContractorSpecialty } from '../../types'
import api from '../../services/api'

type CreateContractorScreenNavigationProp = StackNavigationProp<ContractorsStackParamList, 'CreateContractor'>
type CreateContractorScreenRouteProp = RouteProp<ContractorsStackParamList, 'CreateContractor'>

interface Props {
  navigation: CreateContractorScreenNavigationProp
  route: CreateContractorScreenRouteProp
}

const SPECIALTY_OPTIONS: { label: string; value: ContractorSpecialty }[] = [
  { label: 'Plumbing', value: 'PLUMBING' },
  { label: 'Electrical', value: 'ELECTRICAL' },
  { label: 'Heating', value: 'HEATING' },
  { label: 'General', value: 'GENERAL' },
]

/**
 * CreateContractorScreen - Screen for creating and editing contractors
 * Dark Mode Support
 */
export default function CreateContractorScreen({ navigation, route }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const contractorId = route.params?.contractorId
  const isEditMode = !!contractorId

  // Form state
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [specialties, setSpecialties] = useState<ContractorSpecialty[]>([])
  const [serviceArea, setServiceArea] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [preferred, setPreferred] = useState(false)
  const [notes, setNotes] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Contractor' : 'Add Contractor',
    })
  }, [navigation, isEditMode])

  useEffect(() => {
    loadInitialData()
  }, [isEditMode, contractorId])

  const loadInitialData = async () => {
    if (!isEditMode || !contractorId) return

    try {
      setFetchingData(true)
      setError('')

      const contractor = await api.getContractor(contractorId)
      setName(contractor.name)
      setCompanyName(contractor.company_name || '')
      setPhone(contractor.phone)
      setEmail(contractor.email || '')
      setSpecialties(contractor.specialties || [])
      setServiceArea(contractor.service_area || '')
      setHourlyRate(contractor.hourly_rate !== undefined && contractor.hourly_rate !== null ? contractor.hourly_rate.toString() : '')
      setPreferred(contractor.preferred)
      setNotes(contractor.notes || '')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contractor')
    } finally {
      setFetchingData(false)
    }
  }

  const toggleSpecialty = (specialty: ContractorSpecialty) => {
    setSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty)
      } else {
        return [...prev, specialty]
      }
    })
  }

  const handleSubmit = async () => {
    setError('')

    // Validation
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!phone.trim()) {
      setError('Phone is required')
      return
    }

    if (specialties.length === 0) {
      setError('Please select at least one specialty')
      return
    }

    try {
      setLoading(true)
      const data = {
        name: name.trim(),
        company_name: companyName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        specialties,
        service_area: serviceArea.trim() || undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        preferred,
        notes: notes.trim() || undefined,
      }

      if (isEditMode && contractorId) {
        await api.updateContractor(contractorId, data)
      } else {
        await api.createContractor(data)
      }

      navigation.goBack()
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} contractor`)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
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
          {/* Name */}
          <Input
            label={
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
            }
            value={name}
            onChangeText={setName}
            placeholder="e.g., John Smith"
            style={styles.input}
          />

          {/* Company Name */}
          <Input
            label="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="e.g., Smith Plumbing Ltd"
            style={styles.input}
          />

          {/* Phone */}
          <Input
            label={
              <Text style={styles.label}>
                Phone <Text style={styles.required}>*</Text>
              </Text>
            }
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g., 07700 900000"
            keyboardType="phone-pad"
            style={styles.input}
          />

          {/* Email */}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g., john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {/* Specialties */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Specialties <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.checkboxContainer}>
              {SPECIALTY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.checkboxRow}
                  onPress={() => toggleSpecialty(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    specialties.includes(option.value) && styles.checkboxChecked
                  ]}>
                    {specialties.includes(option.value) && (
                      <Text style={styles.checkboxIcon}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Service Area */}
          <Input
            label="Service Area"
            value={serviceArea}
            onChangeText={setServiceArea}
            placeholder="e.g., London, Greater Manchester"
            style={styles.input}
          />

          {/* Hourly Rate */}
          <Input
            label="Hourly Rate (£)"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder="e.g., 45.00"
            keyboardType="decimal-pad"
            style={styles.input}
          />

          {/* Preferred */}
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>Preferred Contractor</Text>
              <Text style={styles.switchDescription}>Mark as a preferred contractor</Text>
            </View>
            <Switch
              value={preferred}
              onValueChange={setPreferred}
              trackColor={{ false: colors.neutral200, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Notes */}
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes (optional)"
            multiline
            numberOfLines={4}
            style={styles.input}
            inputStyle={styles.textArea}
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
            {isEditMode ? 'Update Contractor' : 'Add Contractor'}
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
    inputContainer: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
    },
    required: {
      color: colors.error,
    },
    input: {
      marginBottom: spacing.md,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
    },
    checkboxContainer: {
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surface,
      marginRight: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkboxIcon: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
    },
    checkboxLabel: {
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    switchLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xxs,
    },
    switchDescription: {
      fontSize: typography.fontSize.sm,
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
  })
