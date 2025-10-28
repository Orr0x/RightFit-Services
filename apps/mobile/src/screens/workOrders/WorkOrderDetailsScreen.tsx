import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Title, Paragraph, Chip } from 'react-native-paper'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { WorkOrdersStackParamList, WorkOrder } from '../../types'
import api from '../../services/api'

type WorkOrderDetailsScreenNavigationProp = StackNavigationProp<WorkOrdersStackParamList, 'WorkOrderDetails'>
type WorkOrderDetailsScreenRouteProp = RouteProp<WorkOrdersStackParamList, 'WorkOrderDetails'>

interface Props {
  navigation: WorkOrderDetailsScreenNavigationProp
  route: WorkOrderDetailsScreenRouteProp
}

export default function WorkOrderDetailsScreen({ route }: Props) {
  const { workOrderId } = route.params
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    fetchWorkOrder()
  }, [workOrderId])

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
