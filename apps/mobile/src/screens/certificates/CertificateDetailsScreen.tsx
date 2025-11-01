import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native'
import { Card, Spinner, Button } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { CertificatesStackParamList, Certificate } from '../../types'
import api from '../../services/api'

type CertificateDetailsScreenNavigationProp = StackNavigationProp<CertificatesStackParamList, 'CertificateDetails'>
type CertificateDetailsScreenRouteProp = RouteProp<CertificatesStackParamList, 'CertificateDetails'>

interface Props {
  navigation: CertificateDetailsScreenNavigationProp
  route: CertificateDetailsScreenRouteProp
}

/**
 * CertificateDetailsScreen - Screen displaying certificate details
 * Dark Mode Support
 */
export default function CertificateDetailsScreen({ route, navigation }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const { certificateId } = route.params
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const data = await api.getCertificate(certificateId)
        setCertificate(data)
      } catch (error) {
        console.error('Failed to fetch certificate:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificate()
  }, [certificateId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCertificateType = (type: string) => {
    return type.replace(/_/g, ' ')
  }

  const getExpiryStatus = (certificate: Certificate) => {
    if (certificate.is_expired) {
      return {
        color: colors.error,
        label: 'Expired',
        backgroundColor: colors.neutral100
      }
    } else if (certificate.days_until_expiry <= 30) {
      return {
        color: colors.warning,
        label: `Expires in ${certificate.days_until_expiry} days`,
        backgroundColor: colors.neutral100
      }
    } else {
      return {
        color: colors.success,
        label: `Valid for ${certificate.days_until_expiry} days`,
        backgroundColor: colors.neutral100
      }
    }
  }

  if (loading || !certificate) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    )
  }

  const expiryStatus = getExpiryStatus(certificate)

  return (
    <ScrollView style={styles.container}>
      <Card variant="outlined" style={styles.card}>
        <Text style={styles.title}>{formatCertificateType(certificate.certificate_type)}</Text>

        <View style={[styles.statusBanner, { backgroundColor: expiryStatus.backgroundColor }]}>
          <Text style={[styles.statusBannerText, { color: expiryStatus.color }]}>
            {expiryStatus.label}
          </Text>
        </View>

        {certificate.property && (
          <View style={styles.section}>
            <Text style={styles.label}>Property</Text>
            <Text style={styles.value}>{certificate.property.name}</Text>
            <Text style={styles.secondaryValue}>
              {certificate.property.address_line1}, {certificate.property.city}
            </Text>
          </View>
        )}

        <View style={styles.dateSection}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{formatDate(certificate.issue_date)}</Text>
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>Expiry Date</Text>
            <Text style={styles.value}>{formatDate(certificate.expiry_date)}</Text>
          </View>
        </View>

        {certificate.certificate_number && (
          <View style={styles.section}>
            <Text style={styles.label}>Certificate Number</Text>
            <Text style={styles.value}>{certificate.certificate_number}</Text>
          </View>
        )}

        {certificate.issuer_name && (
          <View style={styles.section}>
            <Text style={styles.label}>Issuer Name</Text>
            <Text style={styles.value}>{certificate.issuer_name}</Text>
          </View>
        )}

        {certificate.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{certificate.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Created At</Text>
          <Text style={styles.value}>{formatDate(certificate.created_at)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={() => navigation.navigate('CreateCertificate', { certificateId: certificate.id })}
          >
            Edit Certificate
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
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
      textTransform: 'capitalize',
    },
    statusBanner: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    statusBannerText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    section: {
      marginTop: spacing.lg,
    },
    dateSection: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      gap: spacing.lg,
    },
    dateColumn: {
      flex: 1,
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
    secondaryValue: {
      fontSize: typography.fontSize.sm,
      color: colors.textTertiary,
      marginTop: spacing.xxs,
    },
    buttonContainer: {
      marginTop: spacing.lg,
    },
  })
