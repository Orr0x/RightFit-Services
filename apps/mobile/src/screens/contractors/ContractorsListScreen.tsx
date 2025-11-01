import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native'
import { Card, EmptyState, Spinner } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { ContractorsStackParamList, Contractor } from '../../types'
import api from '../../services/api'
import * as Haptics from 'expo-haptics'

type ContractorsListScreenNavigationProp = StackNavigationProp<ContractorsStackParamList, 'ContractorsList'>

interface Props {
  navigation: ContractorsListScreenNavigationProp
}

/**
 * ContractorsListScreen - Screen displaying list of contractors
 * Dark Mode Support
 */
export default function ContractorsListScreen({ navigation }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchContractors = async () => {
    try {
      setLoading(true)
      const data = await api.getContractors()
      setContractors(data)
    } catch (error) {
      console.error('Failed to fetch contractors:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchContractors()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchContractors()
  }, [])

  const formatSpecialties = (specialties: string[]) => {
    return specialties.map(s => s.replace(/_/g, ' ')).join(', ')
  }

  const renderContractor = ({ item }: { item: Contractor }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ContractorDetails', { contractorId: item.id })}
      activeOpacity={0.7}
    >
      <Card variant="outlined" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.contractorName}>{item.name}</Text>
            {item.preferred && (
              <View style={styles.preferredBadge}>
                <Text style={styles.preferredBadgeText}>Preferred</Text>
              </View>
            )}
          </View>
        </View>

        {item.company_name && (
          <Text style={styles.companyName}>{item.company_name}</Text>
        )}

        <Text style={styles.phone}>{item.phone}</Text>

        {item.specialties && item.specialties.length > 0 && (
          <View style={styles.chips}>
            {item.specialties.map((specialty, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{specialty.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {loading && contractors.length === 0 ? (
        <Spinner size="large" />
      ) : contractors.length === 0 ? (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>👷</Text>}
          title="No contractors yet"
          description="Add your first contractor to get started"
        />
      ) : (
        <FlatList
          data={contractors}
          renderItem={renderContractor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          navigation.navigate('CreateContractor')
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
    },
    list: {
      padding: spacing.md,
      paddingBottom: 100, // Space for FAB
    },
    card: {
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    contractorName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
    },
    preferredBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
    },
    preferredBadgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
    companyName: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xxs,
    },
    phone: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.neutral100,
      borderRadius: borderRadius.full,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    chipText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    fab: {
      position: 'absolute',
      bottom: spacing.lg,
      right: spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.neutral900,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    fabText: {
      fontSize: 32,
      color: colors.white,
      fontWeight: '300',
      lineHeight: 32,
    },
  })
