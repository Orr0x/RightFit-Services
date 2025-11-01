import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity
} from 'react-native'
import { Input, Button, Spinner } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { CertificatesStackParamList, Property, CertificateType } from '../../types'
import api from '../../services/api'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'

type CreateCertificateScreenNavigationProp = StackNavigationProp<CertificatesStackParamList, 'CreateCertificate'>
type CreateCertificateScreenRouteProp = RouteProp<CertificatesStackParamList, 'CreateCertificate'>

interface Props {
  navigation: CreateCertificateScreenNavigationProp
  route: CreateCertificateScreenRouteProp
}

const CERTIFICATE_TYPES: { label: string; value: CertificateType }[] = [
  { label: 'Gas Safety', value: 'GAS_SAFETY' },
  { label: 'Electrical', value: 'ELECTRICAL' },
  { label: 'EPC', value: 'EPC' },
  { label: 'STL License', value: 'STL_LICENSE' },
  { label: 'Other', value: 'OTHER' },
]

/**
 * CreateCertificateScreen - Screen for creating and editing certificates
 * Dark Mode Support
 */
export default function CreateCertificateScreen({ navigation, route }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const certificateId = route.params?.certificateId
  const isEditMode = !!certificateId

  // Form state
  const [propertyId, setPropertyId] = useState('')
  const [certificateType, setCertificateType] = useState<CertificateType>('GAS_SAFETY')
  const [issueDate, setIssueDate] = useState(new Date())
  const [expiryDate, setExpiryDate] = useState(new Date())
  const [certificateNumber, setCertificateNumber] = useState('')
  const [issuerName, setIssuerName] = useState('')
  const [notes, setNotes] = useState('')

  // UI state
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false)
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Certificate' : 'Add Certificate',
    })
  }, [navigation, isEditMode])

  useEffect(() => {
    loadInitialData()
  }, [isEditMode, certificateId])

  const loadInitialData = async () => {
    try {
      setFetchingData(true)
      setError('')

      // Load properties for dropdown
      const propertiesData = await api.getProperties()
      setProperties(propertiesData)

      // Set default property if only one exists
      if (propertiesData.length === 1) {
        setPropertyId(propertiesData[0].id)
      }

      // Load certificate data if editing
      if (isEditMode && certificateId) {
        const certificate = await api.getCertificate(certificateId)
        setPropertyId(certificate.property_id)
        setCertificateType(certificate.certificate_type)
        setIssueDate(new Date(certificate.issue_date))
        setExpiryDate(new Date(certificate.expiry_date))
        setCertificateNumber(certificate.certificate_number || '')
        setIssuerName(certificate.issuer_name || '')
        setNotes(certificate.notes || '')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setFetchingData(false)
    }
  }

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleIssueDateChange = (event: any, selectedDate?: Date) => {
    setShowIssueDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setIssueDate(selectedDate)
    }
  }

  const handleExpiryDateChange = (event: any, selectedDate?: Date) => {
    setShowExpiryDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setExpiryDate(selectedDate)
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!propertyId || !certificateType || !issueDate || !expiryDate) {
      setError('Please fill in all required fields')
      return
    }

    if (expiryDate <= issueDate) {
      setError('Expiry date must be after issue date')
      return
    }

    try {
      setLoading(true)
      const data = {
        property_id: propertyId,
        certificate_type: certificateType,
        issue_date: issueDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        certificate_number: certificateNumber || undefined,
        issuer_name: issuerName || undefined,
        notes: notes || undefined,
      }

      if (isEditMode && certificateId) {
        await api.updateCertificate(certificateId, data)
      } else {
        await api.createCertificate(data)
      }

      navigation.goBack()
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} certificate`)
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
          {/* Property Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Property <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={propertyId}
                onValueChange={(itemValue) => setPropertyId(itemValue)}
                style={styles.picker}
                dropdownIconColor={colors.textPrimary}
              >
                <Picker.Item label="Select a property" value="" />
                {properties.map((property) => (
                  <Picker.Item
                    key={property.id}
                    label={property.name}
                    value={property.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Certificate Type Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Certificate Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={certificateType}
                onValueChange={(itemValue) => setCertificateType(itemValue)}
                style={styles.picker}
                dropdownIconColor={colors.textPrimary}
              >
                {CERTIFICATE_TYPES.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Issue Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Issue Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowIssueDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDateDisplay(issueDate)}</Text>
            </TouchableOpacity>
            {showIssueDatePicker && (
              <DateTimePicker
                value={issueDate}
                mode="date"
                display="default"
                onChange={handleIssueDateChange}
              />
            )}
          </View>

          {/* Expiry Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Expiry Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowExpiryDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDateDisplay(expiryDate)}</Text>
            </TouchableOpacity>
            {showExpiryDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={handleExpiryDateChange}
              />
            )}
          </View>

          {/* Certificate Number */}
          <Input
            label="Certificate Number"
            value={certificateNumber}
            onChangeText={setCertificateNumber}
            placeholder="e.g., CP12-123456"
            style={styles.input}
          />

          {/* Issuer Name */}
          <Input
            label="Issuer Name"
            value={issuerName}
            onChangeText={setIssuerName}
            placeholder="e.g., Gas Safe Register"
            style={styles.input}
          />

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
            {isEditMode ? 'Update Certificate' : 'Add Certificate'}
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
      marginBottom: spacing.xs,
    },
    required: {
      color: colors.error,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    picker: {
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    dateButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      minHeight: 44,
      justifyContent: 'center',
    },
    dateButtonText: {
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
    },
    input: {
      marginBottom: spacing.md,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: spacing.md,
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
