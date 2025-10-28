import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native'
import { Text, Card, Title, Paragraph, Chip, Divider } from 'react-native-paper'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { WorkOrdersStackParamList, WorkOrder } from '../../types'
import api from '../../services/api'
import PhotoUploadButton from '../../components/PhotoUploadButton'

type WorkOrderDetailsScreenNavigationProp = StackNavigationProp<WorkOrdersStackParamList, 'WorkOrderDetails'>
type WorkOrderDetailsScreenRouteProp = RouteProp<WorkOrdersStackParamList, 'WorkOrderDetails'>

interface Props {
  navigation: WorkOrderDetailsScreenNavigationProp
  route: WorkOrderDetailsScreenRouteProp
}

export default function WorkOrderDetailsScreen({ route }: Props) {
  const { workOrderId } = route.params
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  const fetchWorkOrder = async () => {
    try {
      const data = await api.getWorkOrder(workOrderId)
      setWorkOrder(data)
    } catch (error) {
      console.error('Failed to fetch work order:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true)
      const data = await api.getPhotos({ work_order_id: workOrderId })
      setPhotos(data)
    } catch (error) {
      console.error('Failed to fetch photos:', error)
    } finally {
      setLoadingPhotos(false)
    }
  }

  useEffect(() => {
    fetchWorkOrder()
    fetchPhotos()
  }, [workOrderId])

  const handlePhotoUploaded = () => {
    fetchPhotos()
  }

  if (loading || !workOrder) {
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
          <Title>{workOrder.title}</Title>

          <View style={styles.chips}>
            <Chip mode="outlined" style={styles.chip}>
              {workOrder.status}
            </Chip>
            <Chip mode="outlined" style={styles.chip}>
              {workOrder.priority}
            </Chip>
            <Chip mode="outlined" style={styles.chip}>
              {workOrder.category}
            </Chip>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description:</Text>
            <Paragraph>{workOrder.description}</Paragraph>
          </View>

          {workOrder.property && (
            <View style={styles.section}>
              <Text style={styles.label}>Property:</Text>
              <Paragraph>{workOrder.property.name || 'N/A'}</Paragraph>
              {(workOrder.property.address_line1 || workOrder.property.city) && (
                <Paragraph>
                  {[workOrder.property.address_line1, workOrder.property.city].filter(Boolean).join(', ')}
                </Paragraph>
              )}
            </View>
          )}

          {workOrder.contractor && (
            <View style={styles.section}>
              <Text style={styles.label}>Assigned Contractor:</Text>
              <Paragraph>{workOrder.contractor.name || 'N/A'}</Paragraph>
              {workOrder.contractor.company_name && (
                <Paragraph>{workOrder.contractor.company_name}</Paragraph>
              )}
              {workOrder.contractor.phone && (
                <Paragraph>{workOrder.contractor.phone}</Paragraph>
              )}
            </View>
          )}

          {workOrder.estimated_cost != null && (
            <View style={styles.section}>
              <Text style={styles.label}>Estimated Cost:</Text>
              <Paragraph>£{Number(workOrder.estimated_cost).toFixed(2)}</Paragraph>
            </View>
          )}

          {workOrder.due_date && (
            <View style={styles.section}>
              <Text style={styles.label}>Due Date & Time:</Text>
              <Paragraph>
                {new Date(workOrder.due_date).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Photo Upload & Gallery */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Photos</Title>

          <PhotoUploadButton
            workOrderId={workOrderId}
            onPhotoUploaded={handlePhotoUploaded}
            label="Add Photo"
          />

          {loadingPhotos ? (
            <Text style={styles.loadingText}>Loading photos...</Text>
          ) : photos.length === 0 ? (
            <Text style={styles.emptyText}>No photos yet. Add your first photo above.</Text>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => {
                    // Open full size image in browser or external viewer
                    if (photo.s3_url) {
                      Linking.openURL(photo.s3_url)
                    }
                  }}
                  style={styles.photoContainer}
                >
                  <Image
                    source={{ uri: photo.thumbnail_url || photo.s3_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  {photo.caption && (
                    <Text style={styles.photoCaption} numberOfLines={2}>
                      {photo.caption}
                    </Text>
                  )}
                  <Text style={styles.photoDate}>
                    {new Date(photo.created_at).toLocaleDateString('en-GB')}
                  </Text>
                </TouchableOpacity>
              ))}
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
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 12,
  },
  photoContainer: {
    width: '47%',
    marginBottom: 8,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  photoCaption: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  photoDate: {
    marginTop: 2,
    fontSize: 10,
    color: '#999',
  },
})
