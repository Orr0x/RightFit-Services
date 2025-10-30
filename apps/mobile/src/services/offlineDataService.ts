import { Q } from '@nozbe/watermelondb'
import { database } from '../database'
import { WorkOrder, Photo } from '../database/models'
import api from './api'
import syncService from './syncService'
import NetInfo from '@react-native-community/netinfo'

class OfflineDataService {
  // Check if offline database is available
  isDatabaseAvailable(): boolean {
    return database !== null
  }

  // Check if device is online
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch()
    return state.isConnected && state.isInternetReachable !== false
  }

  // Create a work order (offline-aware)
  async createWorkOrder(data: any): Promise<any> {
    const online = await this.isOnline()

    if (online) {
      try {
        // Try to create on server first
        const serverWorkOrder = await api.createWorkOrder(data)

        // Also save to local database for offline access
        if (this.isDatabaseAvailable()) {
          await database!.write(async () => {
            const workOrdersCollection = database!.get<WorkOrder>('work_orders')
          await workOrdersCollection.create(workOrder => {
            workOrder.serverId = serverWorkOrder.id
            workOrder.tenantId = serverWorkOrder.tenant_id
            workOrder.propertyId = serverWorkOrder.property_id
            workOrder.contractorId = serverWorkOrder.contractor_id
            workOrder.title = serverWorkOrder.title
            workOrder.description = serverWorkOrder.description
            workOrder.status = serverWorkOrder.status
            workOrder.priority = serverWorkOrder.priority
            workOrder.category = serverWorkOrder.category
            workOrder.estimatedCost = serverWorkOrder.estimated_cost
            workOrder.actualCost = serverWorkOrder.actual_cost
            workOrder.dueDate = serverWorkOrder.due_date ? new Date(serverWorkOrder.due_date).getTime() : null
            workOrder.completedAt = serverWorkOrder.completed_at ? new Date(serverWorkOrder.completed_at).getTime() : null
            workOrder.synced = true
          })
        })
        }

        return serverWorkOrder
      } catch (error) {
        console.error('Error creating work order on server:', error)
        // Fall through to offline mode
      }
    }

    // Offline mode: save to local database only
    if (!this.isDatabaseAvailable()) {
      throw new Error('Cannot create work order: Device is offline and database not available')
    }

    let localWorkOrder: any = null
    await database!.write(async () => {
      const workOrdersCollection = database!.get<WorkOrder>('work_orders')
      localWorkOrder = await workOrdersCollection.create(workOrder => {
        workOrder.tenantId = data.tenant_id
        workOrder.propertyId = data.property_id
        workOrder.contractorId = data.contractor_id
        workOrder.title = data.title
        workOrder.description = data.description
        workOrder.status = data.status || 'OPEN'
        workOrder.priority = data.priority || 'MEDIUM'
        workOrder.category = data.category
        workOrder.estimatedCost = data.estimated_cost
        workOrder.actualCost = data.actual_cost
        workOrder.dueDate = data.due_date ? new Date(data.due_date).getTime() : null
        workOrder.synced = false
      })
    })

    // Add to sync queue
    await syncService.addToSyncQueue('work_order', localWorkOrder.id, 'create', data)

    return {
      id: localWorkOrder.id,
      ...data,
      created_at: localWorkOrder.createdAt,
      updated_at: localWorkOrder.updatedAt,
      _offline: true,
    }
  }

  // Update a work order (offline-aware)
  async updateWorkOrder(id: string, data: any): Promise<any> {
    const online = await this.isOnline()

    if (!this.isDatabaseAvailable()) {
      if (!online) {
        throw new Error('Cannot update work order: Device is offline and database not available')
      }
      return await api.updateWorkOrder(id, data)
    }

    // Find the local work order
    const workOrdersCollection = database!.get<WorkOrder>('work_orders')
    let localWorkOrder: WorkOrder | null = null

    try {
      // Try to find by server_id first
      const byServerId = await workOrdersCollection
        .query(Q.where('server_id', id))
        .fetch()

      if (byServerId.length > 0) {
        localWorkOrder = byServerId[0]
      } else {
        // Try by local id
        localWorkOrder = await workOrdersCollection.find(id)
      }
    } catch (error) {
      console.error('Work order not found:', error)
      throw new Error('Work order not found')
    }

    if (online && localWorkOrder.serverId) {
      try {
        // Try to update on server first
        const serverWorkOrder = await api.updateWorkOrder(localWorkOrder.serverId, data)

        // Update local database
        await database!.write(async () => {
          await localWorkOrder.update(workOrder => {
            if (data.title !== undefined) workOrder.title = data.title
            if (data.description !== undefined) workOrder.description = data.description
            if (data.status !== undefined) workOrder.status = data.status
            if (data.priority !== undefined) workOrder.priority = data.priority
            if (data.category !== undefined) workOrder.category = data.category
            if (data.estimated_cost !== undefined) workOrder.estimatedCost = data.estimated_cost
            if (data.actual_cost !== undefined) workOrder.actualCost = data.actual_cost
            if (data.contractor_id !== undefined) workOrder.contractorId = data.contractor_id
            if (data.due_date !== undefined) workOrder.dueDate = data.due_date ? new Date(data.due_date).getTime() : null
            workOrder.synced = true
          })
        })

        return serverWorkOrder
      } catch (error) {
        console.error('Error updating work order on server:', error)
        // Fall through to offline mode
      }
    }

    // Offline mode: update local database only
    await database!.write(async () => {
      await localWorkOrder.update(workOrder => {
        if (data.title !== undefined) workOrder.title = data.title
        if (data.description !== undefined) workOrder.description = data.description
        if (data.status !== undefined) workOrder.status = data.status
        if (data.priority !== undefined) workOrder.priority = data.priority
        if (data.category !== undefined) workOrder.category = data.category
        if (data.estimated_cost !== undefined) workOrder.estimatedCost = data.estimated_cost
        if (data.actual_cost !== undefined) workOrder.actualCost = data.actual_cost
        if (data.contractor_id !== undefined) workOrder.contractorId = data.contractor_id
        if (data.due_date !== undefined) workOrder.dueDate = data.due_date ? new Date(data.due_date).getTime() : null
        workOrder.synced = false
      })
    })

    // Add to sync queue
    await syncService.addToSyncQueue('work_order', localWorkOrder.id, 'update', data)

    return {
      id: localWorkOrder.serverId || localWorkOrder.id,
      ...data,
      updated_at: new Date(),
      _offline: true,
    }
  }

  // Upload a photo (offline-aware)
  async uploadPhoto(localUri: string, data: any): Promise<any> {
    const online = await this.isOnline()

    if (!this.isDatabaseAvailable()) {
      if (!online) {
        throw new Error('Cannot upload photo: Device is offline and database not available')
      }

      const formData = new FormData()
      formData.append('photo', {
        uri: localUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any)

      if (data.work_order_id) {
        formData.append('work_order_id', data.work_order_id)
        formData.append('label', data.label || 'DURING')
      }
      if (data.property_id) {
        formData.append('property_id', data.property_id)
        formData.append('label', data.label || 'PROPERTY')
      }
      if (data.caption) {
        formData.append('caption', data.caption)
      }

      return await api.uploadPhoto(formData)
    }

    // Save to local database first
    let localPhoto: any = null
    await database!.write(async () => {
      const photosCollection = database!.get<Photo>('photos')
      localPhoto = await photosCollection.create(photo => {
        photo.tenantId = data.tenant_id
        photo.workOrderId = data.work_order_id
        photo.propertyId = data.property_id
        photo.localUri = localUri
        photo.label = data.label
        photo.caption = data.caption
        photo.synced = false
      })
    })

    if (online) {
      try {
        // Try to upload immediately
        const formData = new FormData()
        formData.append('photo', {
          uri: localUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any)

        if (data.work_order_id) {
          formData.append('work_order_id', data.work_order_id)
          formData.append('label', data.label || 'DURING')
        }
        if (data.property_id) {
          formData.append('property_id', data.property_id)
          formData.append('label', data.label || 'PROPERTY')
        }
        if (data.caption) {
          formData.append('caption', data.caption)
        }

        const serverPhoto = await api.uploadPhoto(formData)

        // Update local record
        await database!.write(async () => {
          await localPhoto.update((photo: Photo) => {
            photo.serverId = serverPhoto.id
            photo.s3Url = serverPhoto.s3_url
            photo.thumbnailUrl = serverPhoto.thumbnail_url
            photo.synced = true
          })
        })

        return serverPhoto
      } catch (error) {
        console.error('Error uploading photo to server:', error)
        // Fall through to offline mode
      }
    }

    // Add to sync queue for later upload
    await syncService.addToSyncQueue('photo', localPhoto.id, 'create', {
      ...data,
      local_uri: localUri,
    })

    return {
      id: localPhoto.id,
      local_uri: localUri,
      s3_url: null,
      thumbnail_url: null,
      ...data,
      created_at: localPhoto.createdAt,
      _offline: true,
    }
  }

  // Get work orders from local database
  async getLocalWorkOrders(): Promise<any[]> {
    if (!this.isDatabaseAvailable()) {
      return []
    }

    const workOrdersCollection = database!.get<WorkOrder>('work_orders')
    const workOrders = await workOrdersCollection.query().fetch()

    return workOrders.map(wo => ({
      id: wo.serverId || wo.id,
      tenant_id: wo.tenantId,
      property_id: wo.propertyId,
      contractor_id: wo.contractorId,
      title: wo.title,
      description: wo.description,
      status: wo.status,
      priority: wo.priority,
      category: wo.category,
      estimated_cost: wo.estimatedCost,
      actual_cost: wo.actualCost,
      due_date: wo.dueDate ? new Date(wo.dueDate).toISOString() : null,
      completed_at: wo.completedAt ? new Date(wo.completedAt).toISOString() : null,
      created_at: wo.createdAt.toISOString(),
      updated_at: wo.updatedAt.toISOString(),
      synced: wo.synced,
      _offline: !wo.synced,
    }))
  }

  // Get photos from local database
  async getLocalPhotos(workOrderId?: string, propertyId?: string): Promise<any[]> {
    if (!this.isDatabaseAvailable()) {
      return []
    }

    const photosCollection = database!.get<Photo>('photos')
    const conditions = []

    if (workOrderId) {
      conditions.push(Q.where('work_order_id', workOrderId))
    }
    if (propertyId) {
      conditions.push(Q.where('property_id', propertyId))
    }

    const query = conditions.length > 0
      ? photosCollection.query(...conditions)
      : photosCollection.query()

    const photos = await query.fetch()

    return photos.map(photo => ({
      id: photo.serverId || photo.id,
      tenant_id: photo.tenantId,
      work_order_id: photo.workOrderId,
      property_id: photo.propertyId,
      local_uri: photo.localUri,
      s3_url: photo.s3Url,
      thumbnail_url: photo.thumbnailUrl,
      label: photo.label,
      caption: photo.caption,
      created_at: photo.createdAt.toISOString(),
      synced: photo.synced,
      _offline: !photo.synced,
    }))
  }

  // Get properties from local database
  async getLocalProperties(): Promise<any[]> {
    if (!this.isDatabaseAvailable()) {
      return []
    }

    const Property = database!.collections.get('properties')
    const properties = await Property.query().fetch()

    return properties.map((prop: any) => ({
      id: prop.serverId || prop.id,
      tenant_id: prop.tenantId,
      name: prop.name,
      address_line1: prop.addressLine1,
      address_line2: prop.addressLine2,
      city: prop.city,
      state: prop.state,
      postcode: prop.zipCode, // Map zipCode back to postcode for UI
      zip_code: prop.zipCode,
      property_type: prop.type, // Map type back to property_type for UI
      type: prop.type,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      square_footage: prop.squareFootage,
      rent_amount: prop.rentAmount,
      status: prop.status,
      created_at: prop.createdAt.toISOString(),
      updated_at: prop.updatedAt.toISOString(),
      synced: prop.synced,
      _offline: !prop.synced,
    }))
  }
}

export default new OfflineDataService()
