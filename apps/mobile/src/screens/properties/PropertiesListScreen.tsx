import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native'
import { Card, Button, EmptyState, Spinner } from '../../components/ui'
import { colors, spacing, typography, borderRadius } from '../../styles/tokens'
import { StackNavigationProp } from '@react-navigation/stack'
import { PropertiesStackParamList, Property } from '../../types'
import { Q } from '@nozbe/watermelondb'
import api from '../../services/api'
import offlineDataService from '../../services/offlineDataService'
import { database } from '../../database'

type PropertiesListScreenNavigationProp = StackNavigationProp<PropertiesStackParamList, 'PropertiesList'>

interface Props {
  navigation: PropertiesListScreenNavigationProp
}

export default function PropertiesListScreen({ navigation }: Props) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProperties = async () => {
    try {
      setLoading(true)

      // Check if online
      const isOnline = await offlineDataService.isOnline()

      if (isOnline) {
        try {
          // Fetch from API when online
          const data = await api.getProperties()
          setProperties(data)

          // Save to local database for offline access
          if (database) {
            await database.write(async () => {
              const propertiesCollection = database.collections.get('properties')

              for (const prop of data) {
                try {
                  // Check if property already exists by server_id
                  const existing = await propertiesCollection
                    .query(Q.where('server_id', prop.id))
                    .fetch()

                  if (existing.length > 0) {
                    // Update existing
                    await existing[0].update((property: any) => {
                      property.name = prop.name
                      property.addressLine1 = prop.address_line1
                      property.addressLine2 = prop.address_line2 || null
                      property.city = prop.city
                      property.zipCode = prop.postcode || prop.zip_code
                      property.type = prop.property_type || prop.type
                      property.bedrooms = prop.bedrooms || 0
                      property.bathrooms = prop.bathrooms || 0
                      property.status = prop.status || 'ACTIVE'
                      property.synced = true
                    })
                  } else {
                    // Create new
                    await propertiesCollection.create((property: any) => {
                      property.serverId = prop.id
                      property.tenantId = prop.tenant_id
                      property.name = prop.name
                      property.addressLine1 = prop.address_line1
                      property.addressLine2 = prop.address_line2 || null
                      property.city = prop.city
                      property.zipCode = prop.postcode || prop.zip_code
                      property.type = prop.property_type || prop.type
                      property.bedrooms = prop.bedrooms || 0
                      property.bathrooms = prop.bathrooms || 0
                      property.status = prop.status || 'ACTIVE'
                      property.synced = true
                    })
                  }
                } catch (err) {
                  console.error('Error saving property to local DB:', err)
                }
              }
            })
          }
        } catch (error) {
          console.error('Failed to fetch properties from API:', error)
          // Fall back to local data if API fails
          const localData = await offlineDataService.getLocalProperties()
          setProperties(localData as Property[])
        }
      } else {
        // Offline: load from local database
        console.log('Device offline, loading properties from local database')
        const localData = await offlineDataService.getLocalProperties()
        setProperties(localData as Property[])
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchProperties()
  }, [])

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
      activeOpacity={0.7}
    >
      <Card variant="outlined" style={styles.card}>
        <Text style={styles.propertyName}>{item.name}</Text>
        <Text style={styles.address}>
          {item.address_line1}
          {item.address_line2 ? `, ${item.address_line2}` : ''}
        </Text>
        <Text style={styles.address}>
          {item.city}, {item.postcode}
        </Text>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.property_type}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.bedrooms} bed</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.bathrooms} bath</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {loading && properties.length === 0 ? (
        <Spinner size="large" />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Text style={{ fontSize: 48 }}>🏠</Text>}
          title="No properties yet"
          description="Add your first property to get started"
        />
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <View style={styles.fabContainer}>
        <Button
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('CreateProperty')}
          style={styles.fab}
        >
          + Add Property
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    marginBottom: spacing.md,
  },
  propertyName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  address: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
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
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  fab: {
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
