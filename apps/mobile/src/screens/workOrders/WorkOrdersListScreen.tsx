import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, Card, Title, Paragraph, FAB, Chip } from 'react-native-paper'
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
        return '#D32F2F'
      case 'MEDIUM':
        return '#FBC02D'
      case 'LOW':
        return '#388E3C'
      default:
        return '#757575'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#2196F3'
      case 'ASSIGNED':
        return '#FF9800'
      case 'IN_PROGRESS':
        return '#9C27B0'
      case 'COMPLETED':
        return '#4CAF50'
      case 'CANCELLED':
        return '#757575'
      default:
        return '#757575'
    }
  }

  const renderWorkOrder = ({ item }: { item: WorkOrder }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('WorkOrderDetails', { workOrderId: item.id })}
    >
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{item.title}</Title>
          <Chip
            mode="flat"
            style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priority) }]}
            textStyle={styles.chipText}
          >
            {item.priority}
          </Chip>
        </View>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
        {item.property && (
          <Paragraph style={styles.property}>{item.property.name}</Paragraph>
        )}
        <View style={styles.chips}>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
          <Chip mode="outlined" style={styles.chip}>
            {item.category}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      {workOrders.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No work orders yet</Text>
          <Text style={styles.emptySubtext}>Create your first work order to get started</Text>
        </View>
      ) : (
        <FlatList
          data={workOrders}
          renderItem={renderWorkOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateWorkOrder', {})}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  property: {
    marginTop: 4,
    fontStyle: 'italic',
    color: '#666',
  },
  chips: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  priorityChip: {
    height: 28,
  },
  statusChip: {
    marginRight: 8,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
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
