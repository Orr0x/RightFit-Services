import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators'

export default class FinancialTransaction extends Model {
  static table = 'financial_transactions'
  static associations = {
    properties: { type: 'belongs_to' as const, key: 'property_id' },
  }

  @field('server_id') serverId!: string
  @field('tenant_id') tenantId!: string
  @field('property_id') propertyId!: string
  @field('type') type!: string
  @field('category') category?: string
  @field('amount') amount!: number
  @date('date') date!: Date
  @field('description') description!: string
  @field('receipt_url') receiptUrl?: string
  @field('notes') notes?: string
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('properties', 'property_id') property: any
}
