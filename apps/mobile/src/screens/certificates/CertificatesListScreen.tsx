import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native'
import { Card, EmptyState, Spinner } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { CertificatesStackParamList, Certificate } from '../../types'
import api from '../../services/api'
import * as Haptics from 'expo-haptics'

type CertificatesListScreenNavigationProp = StackNavigationProp<CertificatesStackParamList, 'CertificatesList'>

interface Props {
  navigation: CertificatesListScreenNavigationProp
}

/**
 * CertificatesListScreen - Screen displaying list of certificates
 * Dark Mode Support
 */
export default function CertificatesListScreen({ navigation }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const data = await api.getCertificates()
      setCertificates(data)
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchCertificates()
  }, [])

  const getExpiryStatus = (certificate: Certificate) => {
    if (certificate.is_expired) {
      return { color: colors.error, label: 'Expired' }
    } else if (certificate.days_until_expiry <= 30) {
      return { color: colors.warning, label: `${certificate.days_until_expiry}d left` }
    } else {
      return { color: colors.success, label: `${certificate.days_until_expiry}d left` }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatCertificateType = (type: string) => {
    return type.replace(/_/g, ' ')
  }

  const renderCertificate = ({ item }: { item: Certificate }) => {
    const expiryStatus = getExpiryStatus(item)

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('CertificateDetails', { certificateId: item.id })}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.certificateType}>{formatCertificateType(item.certificate_type)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: expiryStatus.color }]}>
              <Text style={styles.statusBadgeText}>{expiryStatus.label}</Text>
            </View>
          </View>

          {item.property && (
            <Text style={styles.propertyName}>{item.property.name}</Text>
          )}

          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>{formatDate(item.issue_date)}</Text>
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Expiry Date</Text>
              <Text style={styles.dateValue}>{formatDate(item.expiry_date)}</Text>
            </View>
          </View>

          {item.certificate_number && (
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>No. {item.certificate_number}</Text>
              </View>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {loading && certificates.length === 0 ? (
        <Spinner size="large" />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>📜</Text>}
          title="No certificates yet"
          description="Add your first certificate to get started"
        />
      ) : (
        <FlatList
          data={certificates}
          renderItem={renderCertificate}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
          navigation.navigate('CreateCertificate')
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
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    certificateType: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      textTransform: 'capitalize',
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    statusBadgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
    propertyName: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    dateRow: {
      flexDirection: 'row',
      marginTop: spacing.sm,
      gap: spacing.lg,
    },
    dateColumn: {
      flex: 1,
    },
    dateLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xxs,
    },
    dateValue: {
      fontSize: typography.fontSize.sm,
      color: colors.textPrimary,
      fontWeight: typography.fontWeight.medium,
    },
    chips: {
      flexDirection: 'row',
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.neutral100,
      borderRadius: borderRadius.full,
    },
    chipText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
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
