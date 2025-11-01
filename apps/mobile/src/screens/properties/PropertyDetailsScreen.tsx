import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native'
import { Card, Spinner, Button } from '../../components/ui'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { PropertiesStackParamList, Property } from '../../types'
import api from '../../services/api'

type PropertyDetailsScreenNavigationProp = StackNavigationProp<PropertiesStackParamList, 'PropertyDetails'>
type PropertyDetailsScreenRouteProp = RouteProp<PropertiesStackParamList, 'PropertyDetails'>

interface Props {
  navigation: PropertyDetailsScreenNavigationProp
  route: PropertyDetailsScreenRouteProp
}

/**
 * PropertyDetailsScreen - Screen displaying property details
 * STORY-005: Dark Mode Support
 */
export default function PropertyDetailsScreen({ route, navigation }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const { propertyId } = route.params
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await api.getProperty(propertyId)
        setProperty(data)
      } catch (error) {
        console.error('Failed to fetch property:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId])

  if (loading || !property) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Card variant="outlined" style={styles.card}>
        <Text style={styles.title}>{property.name}</Text>
        <Text style={styles.address}>
          {property.address_line1}
          {property.address_line2 ? `, ${property.address_line2}` : ''}
        </Text>
        <Text style={styles.address}>
          {property.city}, {property.postcode}
        </Text>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{property.property_type}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{property.bedrooms} bed</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{property.bathrooms} bath</Text>
          </View>
        </View>

        {property.access_instructions && (
          <View style={styles.section}>
            <Text style={styles.label}>Access Instructions:</Text>
            <Text style={styles.value}>{property.access_instructions}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={() => navigation.navigate('CreateProperty', { propertyId: property.id })}
          >
            Edit Property
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
      marginBottom: spacing.sm,
    },
    address: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    badges: {
      flexDirection: 'row',
      marginTop: spacing.md,
      gap: spacing.xs,
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.neutral100,
      borderRadius: borderRadius.full,
      marginRight: spacing.xs,
    },
    badgeText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      textTransform: 'capitalize',
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
    buttonContainer: {
      marginTop: spacing.lg,
    },
  })
