import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators'

export default class PropertyBudget extends Model {
  static table = 'property_budgets'
  static associations = {
    properties: { type: 'belongs_to' as const, key: 'property_id' },
  }

  @field('server_id') serverId!: string
  @field('tenant_id') tenantId!: string
  @field('property_id') propertyId!: string
  @field('monthly_budget') monthlyBudget!: number
  @field('alert_threshold') alertThreshold!: number
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('properties', 'property_id') property: any
}
