import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, children } from '@nozbe/watermelondb/decorators'

export default class Property extends Model {
  static table = 'properties'
  static associations = {
    work_orders: { type: 'has_many' as const, foreignKey: 'property_id' },
    photos: { type: 'has_many' as const, foreignKey: 'property_id' },
    property_tenants: { type: 'has_many' as const, foreignKey: 'property_id' },
    financial_transactions: { type: 'has_many' as const, foreignKey: 'property_id' },
    property_budgets: { type: 'has_many' as const, foreignKey: 'property_id' },
  }

  @field('server_id') serverId!: string
  @field('tenant_id') tenantId!: string
  @field('name') name!: string
  @field('address_line1') addressLine1?: string
  @field('address_line2') addressLine2?: string
  @field('city') city?: string
  @field('state') state?: string
  @field('zip_code') zipCode?: string
  @field('type') type?: string
  @field('bedrooms') bedrooms?: number
  @field('bathrooms') bathrooms?: number
  @field('square_footage') squareFootage?: number
  @field('rent_amount') rentAmount?: number
  @field('status') status!: string
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @children('work_orders') workOrders: any
  @children('photos') photos: any
  @children('property_tenants') propertyTenants: any
  @children('financial_transactions') financialTransactions: any
  @children('property_budgets') propertyBudgets: any
}
