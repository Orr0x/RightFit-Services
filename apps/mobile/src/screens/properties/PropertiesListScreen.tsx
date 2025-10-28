import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, Card, Title, Paragraph, FAB, Chip } from 'react-native-paper'
import { StackNavigationProp } from '@react-navigation/stack'
import { PropertiesStackParamList, Property } from '../../types'
import api from '../../services/api'

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
      const data = await api.getProperties()
      setProperties(data)
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
