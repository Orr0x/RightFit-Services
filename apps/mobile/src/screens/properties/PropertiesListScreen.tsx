import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, Card, Title, Paragraph, FAB, Chip } from 'react-native-paper'
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
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
    >
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>
          {item.address_line1}
          {item.address_line2 ? `, ${item.address_line2}` : ''}
        </Paragraph>
        <Paragraph>
          {item.city}, {item.postcode}
        </Paragraph>
        <View style={styles.chips}>
          <Chip mode="outlined" style={styles.chip}>
            {item.property_type}
          </Chip>
          <Chip mode="outlined" style={styles.chip}>
            {item.bedrooms} bed
          </Chip>
          <Chip mode="outlined" style={styles.chip}>
            {item.bathrooms} bath
          </Chip>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      {properties.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No properties yet</Text>
          <Text style={styles.emptySubtext}>Add your first property to get started</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateProperty')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  chips: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
})
