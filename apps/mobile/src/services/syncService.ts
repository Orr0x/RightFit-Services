import { Q } from '@nozbe/watermelondb'
import { database } from '../database'
import { Property, WorkOrder, Contractor, Photo, SyncQueue } from '../database/models'
import api from './api'
import NetInfo from '@react-native-community/netinfo'

class SyncService {
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private netInfoUnsubscribe: (() => void) | null = null

  // Initialize sync service with network listener
  initialize() {
    console.log('[SYNC] Initializing sync service')

    // Start automatic sync every 5 minutes
    this.startAutoSync()

    // Listen for network connectivity changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      console.log('[SYNC] Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      })

      if (state.isConnected && state.isInternetReachable !== false) {
        console.log('[SYNC] Device back online, triggering sync')
        this.syncAll()
      }
    })

    console.log('[SYNC] Network listener registered')
  }

  // Cleanup
  cleanup() {
    console.log('[SYNC] Cleaning up sync service')
    this.stopAutoSync()
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe()
      this.netInfoUnsubscribe = null
    }
  }

  // Start automatic sync (every 5 minutes when online)
  startAutoSync() {
    this.stopAutoSync()
    this.syncInterval = setInterval(() => {
      console.log('[SYNC] Auto-sync interval triggered')
      this.syncAll()
    }, 5 * 60 * 1000) // 5 minutes
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Check if device is online
  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch()
    return state.isConnected && state.isInternetReachable !== false
  }

  // Main sync function
  async syncAll(): Promise<{ success: boolean; error?: string }> {
    if (!database) {
      console.log('[SYNC] Database not available')
      return { success: false, error: 'Offline mode not available' }
    }

    if (this.isSyncing) {
      console.log('[SYNC] Sync already in progress, skipping')
      return { success: false, error: 'Sync already in progress' }
    }

    const online = await this.isOnline()
    if (!online) {
      console.log('[SYNC] Device is offline, skipping sync')
      return { success: false, error: 'Device is offline' }
    }

    try {
      console.log('[SYNC] Starting sync')
      this.isSyncing = true

      // Step 1: Pull latest data from server
      console.log('[SYNC] Step 1: Pulling data from server')
      await this.pullFromServer()

      // Step 2: Push local changes to server
      console.log('[SYNC] Step 2: Pushing local changes to server')
      await this.pushToServer()

      console.log('[SYNC] Sync completed successfully')
      return { success: true }
    } catch (error: any) {
      console.error('[SYNC] Sync error:', error)
      return { success: false, error: error.message }
    } finally {
      this.isSyncing = false
    }
  }

  // Pull data from server and update local database
  private async pullFromServer() {
    try {
      // Fetch all data from server
      const [properties, workOrders, contractors] = await Promise.all([
        api.getProperties(),
        api.getWorkOrders(),
        api.getContractors(),
      ])

      // Update local database
      await database.write(async () => {
        const propertiesCollection = database.get<Property>('properties')
        const workOrdersCollection = database.get<WorkOrder>('work_orders')
        const contractorsCollection = database.get<Contractor>('contractors')

        // Sync properties
        for (const serverProperty of properties) {
          const existing = await propertiesCollection
            .query(Q.where('server_id', serverProperty.id))
            .fetch()

          if (existing.length > 0) {
            // Update existing
            await existing[0].update(property => {
              Object.assign(property, this.mapPropertyFromServer(serverProperty))
              property.synced = true
            })
          } else {
            // Create new
            await propertiesCollection.create(property => {
              Object.assign(property, this.mapPropertyFromServer(serverProperty))
              property.serverId = serverProperty.id
              property.synced = true
            })
          }
        }

        // Sync work orders
        for (const serverWorkOrder of workOrders) {
          const existing = await workOrdersCollection
            .query(Q.where('server_id', serverWorkOrder.id))
            .fetch()

          if (existing.length > 0) {
            // Update existing
            await existing[0].update(workOrder => {
              Object.assign(workOrder, this.mapWorkOrderFromServer(serverWorkOrder))
              workOrder.synced = true
            })
          } else {
            // Create new
            await workOrdersCollection.create(workOrder => {
              Object.assign(workOrder, this.mapWorkOrderFromServer(serverWorkOrder))
              workOrder.serverId = serverWorkOrder.id
              workOrder.synced = true
            })
          }
        }

        // Sync contractors
        for (const serverContractor of contractors) {
          const existing = await contractorsCollection
            .query(Q.where('server_id', serverContractor.id))
            .fetch()

          if (existing.length > 0) {
            // Update existing
            await existing[0].update(contractor => {
              Object.assign(contractor, this.mapContractorFromServer(serverContractor))
              contractor.synced = true
            })
          } else {
            // Create new
            await contractorsCollection.create(contractor => {
              Object.assign(contractor, this.mapContractorFromServer(serverContractor))
              contractor.serverId = serverContractor.id
              contractor.synced = true
            })
          }
        }
      })
    } catch (error) {
      console.error('Error pulling from server:', error)
      throw error
    }
  }

  // Push local changes to server
  private async pushToServer() {
    try {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue')
      const queueItems = await syncQueueCollection.query().fetch()

      console.log(`[SYNC] Found ${queueItems.length} items in sync queue`)

      for (const queueItem of queueItems) {
        try {
          const payload = JSON.parse(queueItem.payload)
          console.log(`[SYNC] Syncing ${queueItem.entityType} (${queueItem.action}):`, queueItem.entityId)

          switch (queueItem.entityType) {
            case 'work_order':
              await this.syncWorkOrder(queueItem.action, payload, queueItem.entityId)
              break
            case 'photo':
              await this.syncPhoto(queueItem.action, payload, queueItem.entityId)
              break
            // Add other entity types as needed
          }

          // Remove from queue after successful sync
          await database.write(async () => {
            await queueItem.destroyPermanently()
          })
          console.log(`[SYNC] Successfully synced ${queueItem.entityType}:`, queueItem.entityId)
        } catch (error: any) {
          console.error(`[SYNC] Error syncing ${queueItem.entityType}:`, error)

          // Update queue item with error
          await database.write(async () => {
            await queueItem.update(item => {
              item.attempts += 1
              item.lastError = error.message
            })
          })

          // Remove from queue if too many attempts
          if (queueItem.attempts >= 5) {
            console.log(`[SYNC] Removing ${queueItem.entityType} from queue after ${queueItem.attempts} failed attempts`)
            await database.write(async () => {
              await queueItem.destroyPermanently()
            })
          }
        }
      }
    } catch (error) {
      console.error('[SYNC] Error pushing to server:', error)
      throw error
    }
  }

  // Sync individual work order
  private async syncWorkOrder(action: string, payload: any, localId: string) {
    const workOrdersCollection = database.get<WorkOrder>('work_orders')
    const localWorkOrder = await workOrdersCollection.find(localId)

    if (action === 'create') {
      const serverWorkOrder = await api.createWorkOrder(payload)

      await database.write(async () => {
        await localWorkOrder.update(workOrder => {
          workOrder.serverId = serverWorkOrder.id
          workOrder.synced = true
        })
      })
    } else if (action === 'update') {
      await api.updateWorkOrder(localWorkOrder.serverId!, payload)

      await database.write(async () => {
        await localWorkOrder.update(workOrder => {
          workOrder.synced = true
        })
      })
    }
  }

  // Sync individual photo
  private async syncPhoto(action: string, payload: any, localId: string) {
    const photosCollection = database.get<Photo>('photos')
    const localPhoto = await photosCollection.find(localId)

    if (action === 'create') {
      // Upload photo file
      const formData = new FormData()
      formData.append('photo', {
        uri: localPhoto.localUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any)

      if (payload.work_order_id) {
        formData.append('work_order_id', payload.work_order_id)
        formData.append('label', payload.label || 'DURING')
      }
      if (payload.property_id) {
        formData.append('property_id', payload.property_id)
        formData.append('label', payload.label || 'PROPERTY')
      }
      if (payload.caption) {
        formData.append('caption', payload.caption)
      }

      const serverPhoto = await api.uploadPhoto(formData)

      await database.write(async () => {
        await localPhoto.update(photo => {
          photo.serverId = serverPhoto.id
          photo.s3Url = serverPhoto.s3_url
          photo.thumbnailUrl = serverPhoto.thumbnail_url
          photo.synced = true
        })
      })
    }
  }

  // Add item to sync queue
  async addToSyncQueue(entityType: string, entityId: string, action: string, payload: any) {
    if (!database) {
      return
    }

    await database.write(async () => {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue')
      await syncQueueCollection.create(item => {
        item.entityType = entityType
        item.entityId = entityId
        item.action = action
        item.payload = JSON.stringify(payload)
        item.attempts = 0
      })
    })

    // Try to sync immediately if online
    const online = await this.isOnline()
    if (online && !this.isSyncing) {
      this.syncAll()
    }
  }

  // Mapping functions
  private mapPropertyFromServer(serverProperty: any) {
    return {
      tenantId: serverProperty.tenant_id,
      name: serverProperty.name,
      addressLine1: serverProperty.address_line1,
      addressLine2: serverProperty.address_line2,
      city: serverProperty.city,
      state: serverProperty.state,
      zipCode: serverProperty.zip_code,
      type: serverProperty.type,
      bedrooms: serverProperty.bedrooms,
      bathrooms: serverProperty.bathrooms,
      squareFootage: serverProperty.square_footage,
      rentAmount: serverProperty.rent_amount,
      status: serverProperty.status,
    }
  }

  private mapWorkOrderFromServer(serverWorkOrder: any) {
    return {
      tenantId: serverWorkOrder.tenant_id,
      propertyId: serverWorkOrder.property_id,
      contractorId: serverWorkOrder.contractor_id,
      title: serverWorkOrder.title,
      description: serverWorkOrder.description,
      status: serverWorkOrder.status,
      priority: serverWorkOrder.priority,
      category: serverWorkOrder.category,
      estimatedCost: serverWorkOrder.estimated_cost,
      actualCost: serverWorkOrder.actual_cost,
      dueDate: serverWorkOrder.due_date ? new Date(serverWorkOrder.due_date).getTime() : null,
      completedAt: serverWorkOrder.completed_at ? new Date(serverWorkOrder.completed_at).getTime() : null,
    }
  }

  private mapContractorFromServer(serverContractor: any) {
    return {
      tenantId: serverContractor.tenant_id,
      name: serverContractor.name,
      email: serverContractor.email,
      phone: serverContractor.phone,
      companyName: serverContractor.company_name,
      trade: serverContractor.trade,
    }
  }
}

export default new SyncService()
