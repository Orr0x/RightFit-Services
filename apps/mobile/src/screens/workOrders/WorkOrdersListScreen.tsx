import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native'
import { Card, Button, EmptyState, Spinner } from '../../components/ui'
import { colors, spacing, typography, borderRadius } from '../../styles/tokens'
import { StackNavigationProp } from '@react-navigation/stack'
import { WorkOrdersStackParamList, WorkOrder } from '../../types'
import { Q } from '@nozbe/watermelondb'
import api from '../../services/api'
import offlineDataService from '../../services/offlineDataService'
import { database } from '../../database'

type WorkOrdersListScreenNavigationProp = StackNavigationProp<WorkOrdersStackParamList, 'WorkOrdersList'>

interface Props {
  navigation: WorkOrdersListScreenNavigationProp
}

export default function WorkOrdersListScreen({ navigation }: Props) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)

      // Check if online first
      const isOnline = await offlineDataService.isOnline()

      if (isOnline) {
        try {
          // Fetch from API when online
          const data = await api.getWorkOrders()

          // Save API work orders to local database for offline access
          if (database) {
            await database.write(async () => {
              const workOrdersCollection = database.collections.get('work_orders')

              for (const wo of data) {
                try {
                  // Check if work order already exists by server_id
                  const existing = await workOrdersCollection
                    .query(Q.where('server_id', wo.id))
                    .fetch()

                  if (existing.length > 0) {
                    // Update existing
                    await existing[0].update((workOrder: any) => {
                      workOrder.title = wo.title
                      workOrder.description = wo.description
                      workOrder.status = wo.status
                      workOrder.priority = wo.priority
                      workOrder.category = wo.category
                      workOrder.propertyId = wo.property_id
                      workOrder.contractorId = wo.contractor_id
                      workOrder.estimatedCost = wo.estimated_cost
                      workOrder.actualCost = wo.actual_cost
                      workOrder.dueDate = wo.due_date ? new Date(wo.due_date).getTime() : null
                      workOrder.completedAt = wo.completed_at ? new Date(wo.completed_at).getTime() : null
                      workOrder.synced = true
                    })
                  } else {
                    // Create new
                    await workOrdersCollection.create((workOrder: any) => {
                      workOrder.serverId = wo.id
                      workOrder.tenantId = wo.tenant_id
                      workOrder.propertyId = wo.property_id
                      workOrder.contractorId = wo.contractor_id
                      workOrder.title = wo.title
                      workOrder.description = wo.description
                      workOrder.status = wo.status
                      workOrder.priority = wo.priority
                      workOrder.category = wo.category
                      workOrder.estimatedCost = wo.estimated_cost
                      workOrder.actualCost = wo.actual_cost
                      workOrder.dueDate = wo.due_date ? new Date(wo.due_date).getTime() : null
                      workOrder.completedAt = wo.completed_at ? new Date(wo.completed_at).getTime() : null
                      workOrder.synced = true
                    })
                  }
                } catch (err) {
                  console.error('Error saving work order to local DB:', err)
                }
              }
            })
          }

          // Get unsynced local work orders (created offline)
          const localData = await offlineDataService.getLocalWorkOrders()
          const unsyncedLocal = localData.filter((wo: any) => !wo.synced)

          console.log(`[WORK_ORDERS] API returned ${data.length} work orders`)
          console.log(`[WORK_ORDERS] Local DB has ${localData.length} total work orders`)
          console.log(`[WORK_ORDERS] Found ${unsyncedLocal.length} unsynced local work orders`)
          console.log('[WORK_ORDERS] Unsynced work orders:', unsyncedLocal.map((wo: any) => ({ id: wo.id, title: wo.title, synced: wo.synced })))

          // Merge API data with unsynced local work orders
          const mergedData = [...data, ...unsyncedLocal]
          console.log(`[WORK_ORDERS] Merged result: ${mergedData.length} total work orders`)
          setWorkOrders(mergedData as WorkOrder[])
        } catch (error) {
          console.error('Failed to fetch work orders from API:', error)
          // Fall back to local database if API fails
          const localData = await offlineDataService.getLocalWorkOrders()
          setWorkOrders(localData as WorkOrder[])
        }
      } else {
        // Offline: load from local database
        console.log('Device offline, loading work orders from local database')
        const localData = await offlineDataService.getLocalWorkOrders()
        setWorkOrders(localData as WorkOrder[])
      }
    } catch (error) {
      console.error('Failed to fetch work orders:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchWorkOrders()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return colors.error
      case 'MEDIUM':
        return colors.warning
      case 'LOW':
        return colors.success
      default:
        return colors.neutral500
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return colors.info
      case 'ASSIGNED':
        return colors.warning
      case 'IN_PROGRESS':
        return colors.primary
      case 'COMPLETED':
        return colors.success
      case 'CANCELLED':
        return colors.neutral500
      default:
        return colors.neutral500
    }
  }

  const renderWorkOrder = ({ item }: { item: WorkOrder }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('WorkOrderDetails', { workOrderId: item.id })}
      activeOpacity={0.7}
    >
      <Card variant="outlined" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        {item.property && (
          <Text style={styles.property}>{item.property.name}</Text>
        )}
        <View style={styles.badges}>
          <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {loading && workOrders.length === 0 ? (
        <Spinner size="large" />
      ) : workOrders.length === 0 ? (
        <EmptyState
          icon="🔧"
          title="No work orders yet"
          message="Create your first work order to get started"
        />
      ) : (
        <FlatList
          data={workOrders}
          renderItem={renderWorkOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <View style={styles.fabContainer}>
        <Button
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('CreateWorkOrder', {})}
          style={styles.fab}
        >
          + New Work Order
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  property: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
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
