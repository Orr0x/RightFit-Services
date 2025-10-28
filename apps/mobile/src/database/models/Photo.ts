import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators'
import WorkOrder from './WorkOrder'
import Property from './Property'

export default class Photo extends Model {
  static table = 'photos'
  static associations = {
    work_orders: { type: 'belongs_to' as const, key: 'work_order_id' },
    properties: { type: 'belongs_to' as const, key: 'property_id' },
  }

  @field('server_id') serverId?: string
  @field('tenant_id') tenantId!: string
  @field('work_order_id') workOrderId?: string
  @field('property_id') propertyId?: string
  @field('local_uri') localUri!: string
  @field('s3_url') s3Url?: string
  @field('thumbnail_url') thumbnailUrl?: string
  @field('label') label?: string
  @field('caption') caption?: string
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('work_orders', 'work_order_id') workOrder: any
  @relation('properties', 'property_id') property: any
}
