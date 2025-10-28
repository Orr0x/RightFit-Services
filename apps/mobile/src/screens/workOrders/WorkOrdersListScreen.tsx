import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, Card, Title, Paragraph, FAB, Chip } from 'react-native-paper'
import { StackNavigationProp } from '@react-navigation/stack'
import { WorkOrdersStackParamList, WorkOrder } from '../../types'
import api from '../../services/api'

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
      const data = await api.getWorkOrders()
      setWorkOrders(data)
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
      case 'EMERGENCY':
        return '#D32F2F'
      case 'HIGH':
        return '#F57C00'
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
