import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Title, Paragraph, Chip } from 'react-native-paper'
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

export default function PropertyDetailsScreen({ route }: Props) {
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
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{property.name}</Title>
          <Paragraph style={styles.section}>
            {property.address_line1}
            {property.address_line2 ? `, ${property.address_line2}` : ''}
          </Paragraph>
          <Paragraph>
            {property.city}, {property.postcode}
          </Paragraph>

          <View style={styles.chips}>
            <Chip mode="outlined" style={styles.chip}>
              {property.property_type}
            </Chip>
            <Chip mode="outlined" style={styles.chip}>
              {property.bedrooms} bed
            </Chip>
            <Chip mode="outlined" style={styles.chip}>
              {property.bathrooms} bath
            </Chip>
          </View>

          {property.access_instructions && (
            <View style={styles.section}>
              <Text style={styles.label}>Access Instructions:</Text>
              <Paragraph>{property.access_instructions}</Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  section: {
    marginTop: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chips: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
})
