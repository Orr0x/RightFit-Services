import { Model, Q } from '@nozbe/watermelondb'
import { field, readonly, date, relation, children } from '@nozbe/watermelondb/decorators'
import Property from './Property'
import Contractor from './Contractor'

export default class WorkOrder extends Model {
  static table = 'work_orders'
  static associations = {
    properties: { type: 'belongs_to' as const, key: 'property_id' },
    contractors: { type: 'belongs_to' as const, key: 'contractor_id' },
    photos: { type: 'has_many' as const, foreignKey: 'work_order_id' },
  }

  @field('server_id') serverId?: string
  @field('tenant_id') tenantId!: string
  @field('property_id') propertyId!: string
  @field('contractor_id') contractorId?: string
  @field('title') title!: string
  @field('description') description!: string
  @field('status') status!: string
  @field('priority') priority!: string
  @field('category') category!: string
  @field('estimated_cost') estimatedCost?: number
  @field('actual_cost') actualCost?: number
  @field('due_date') dueDate?: number
  @field('completed_at') completedAt?: number
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('properties', 'property_id') property: any
  @relation('contractors', 'contractor_id') contractor: any
  @children('photos') photos: any
}
