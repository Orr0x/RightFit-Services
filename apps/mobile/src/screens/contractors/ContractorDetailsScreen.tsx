import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { Card, Spinner, Button } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { ContractorsStackParamList, Contractor } from '../../types'
import api from '../../services/api'

type ContractorDetailsScreenNavigationProp = StackNavigationProp<ContractorsStackParamList, 'ContractorDetails'>
type ContractorDetailsScreenRouteProp = RouteProp<ContractorsStackParamList, 'ContractorDetails'>

interface Props {
  navigation: ContractorDetailsScreenNavigationProp
  route: ContractorDetailsScreenRouteProp
}

/**
 * ContractorDetailsScreen - Screen displaying contractor details
 * Dark Mode Support
 */
export default function ContractorDetailsScreen({ route, navigation }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const { contractorId } = route.params
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContractor = async () => {
      try {
        const data = await api.getContractor(contractorId)
        setContractor(data)
      } catch (error) {
        console.error('Failed to fetch contractor:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContractor()
  }, [contractorId])

  const formatSpecialty = (specialty: string) => {
    return specialty.replace(/_/g, ' ')
  }

  if (loading || !contractor) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>{contractor.name}</Text>
          {contractor.preferred && (
            <View style={styles.preferredBadge}>
              <Text style={styles.preferredBadgeText}>Preferred Contractor</Text>
            </View>
          )}
        </View>

        {contractor.company_name && (
          <View style={styles.section}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{contractor.company_name}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{contractor.phone}</Text>
        </View>

        {contractor.email && (
          <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{contractor.email}</Text>
          </View>
        )}

        {contractor.specialties && contractor.specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Specialties</Text>
            <View style={styles.chips}>
              {contractor.specialties.map((specialty, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{formatSpecialty(specialty)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {contractor.service_area && (
          <View style={styles.section}>
            <Text style={styles.label}>Service Area</Text>
            <Text style={styles.value}>{contractor.service_area}</Text>
          </View>
        )}

        {contractor.hourly_rate !== undefined && contractor.hourly_rate !== null && (
          <View style={styles.section}>
            <Text style={styles.label}>Hourly Rate</Text>
            <Text style={styles.value}>£{contractor.hourly_rate.toFixed(2)}/hr</Text>
          </View>
        )}

        {contractor.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{contractor.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Created At</Text>
          <Text style={styles.value}>
            {new Date(contractor.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={() => navigation.navigate('CreateContractor', { contractorId: contractor.id })}
          >
            Edit Contractor
          </Button>
        </View>
      </Card>
    </ScrollView>
  )
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
    },
    card: {
      margin: spacing.md,
    },
    headerSection: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    preferredBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
    },
    preferredBadgeText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
    section: {
      marginTop: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    value: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.neutral100,
      borderRadius: borderRadius.full,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    chipText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    buttonContainer: {
      marginTop: spacing.lg,
    },
  })
