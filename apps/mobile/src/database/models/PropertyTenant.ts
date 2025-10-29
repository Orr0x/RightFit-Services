import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, children, relation } from '@nozbe/watermelondb/decorators'

export default class PropertyTenant extends Model {
  static table = 'property_tenants'
  static associations = {
    properties: { type: 'belongs_to' as const, key: 'property_id' },
    rent_payments: { type: 'has_many' as const, foreignKey: 'property_tenant_id' },
  }

  @field('server_id') serverId!: string
  @field('tenant_id') tenantId!: string
  @field('property_id') propertyId!: string
  @field('name') name!: string
  @field('email') email?: string
  @field('phone') phone?: string
  @date('move_in_date') moveInDate!: Date
  @date('lease_expiry_date') leaseExpiryDate?: Date
  @field('rent_amount') rentAmount!: number
  @field('rent_frequency') rentFrequency!: string
  @field('rent_due_day') rentDueDay?: number
  @field('status') status!: string
  @field('notes') notes?: string
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('properties', 'property_id') property: any
  @children('rent_payments') rentPayments: any
}
