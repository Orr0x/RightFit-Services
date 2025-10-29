import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators'

export default class RentPayment extends Model {
  static table = 'rent_payments'
  static associations = {
    property_tenants: { type: 'belongs_to' as const, key: 'property_tenant_id' },
  }

  @field('server_id') serverId!: string
  @field('property_tenant_id') propertyTenantId!: string
  @field('amount') amount!: number
  @date('payment_date') paymentDate!: Date
  @date('expected_date') expectedDate?: Date
  @field('payment_method') paymentMethod?: string
  @field('reference') reference?: string
  @field('notes') notes?: string
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date

  @relation('property_tenants', 'property_tenant_id') propertyTenant: any
}
