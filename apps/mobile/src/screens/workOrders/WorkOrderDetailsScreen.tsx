import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Text } from 'react-native'
import { Card, Spinner } from '../../components/ui'
import { colors, spacing, typography, borderRadius } from '../../styles/tokens'
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
      <View style={styles.centerContainer}>
        <Spinner size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Card variant="outlined" style={styles.card}>
        <Text style={styles.title}>{workOrder.title}</Text>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{workOrder.status}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{workOrder.priority}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{workOrder.category}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{workOrder.description}</Text>
        </View>

        {workOrder.property && (
          <View style={styles.section}>
            <Text style={styles.label}>Property:</Text>
            <Text style={styles.value}>{workOrder.property.name || 'N/A'}</Text>
            {(workOrder.property.address_line1 || workOrder.property.city) && (
              <Text style={styles.value}>
                {[workOrder.property.address_line1, workOrder.property.city].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
        )}

        {workOrder.contractor && (
          <View style={styles.section}>
            <Text style={styles.label}>Assigned Contractor:</Text>
            <Text style={styles.value}>{workOrder.contractor.name || 'N/A'}</Text>
            {workOrder.contractor.company_name && (
              <Text style={styles.value}>{workOrder.contractor.company_name}</Text>
            )}
            {workOrder.contractor.phone && (
              <Text style={styles.value}>{workOrder.contractor.phone}</Text>
            )}
          </View>
        )}

        {workOrder.estimated_cost != null && (
          <View style={styles.section}>
            <Text style={styles.label}>Estimated Cost:</Text>
            <Text style={styles.value}>£{Number(workOrder.estimated_cost).toFixed(2)}</Text>
          </View>
        )}

        {workOrder.due_date && (
          <View style={styles.section}>
            <Text style={styles.label}>Due Date & Time:</Text>
            <Text style={styles.value}>
              {new Date(workOrder.due_date).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
      </Card>

      {/* Photo Upload & Gallery */}
      <Card variant="outlined" style={styles.card}>
        <Text style={styles.title}>Photos</Text>

        <PhotoUploadButton
          workOrderId={workOrderId}
          onPhotoUploaded={handlePhotoUploaded}
          label="Add Photo"
        />

        {loadingPhotos ? (
          <View style={styles.centerContent}>
            <Spinner size="medium" />
          </View>
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
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  centerContent: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  card: {
    margin: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  chips: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
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
    textTransform: 'uppercase',
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  photoContainer: {
    width: '47%',
    marginBottom: spacing.sm,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral100,
  },
  photoCaption: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  photoDate: {
    marginTop: spacing.xxs,
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
})
