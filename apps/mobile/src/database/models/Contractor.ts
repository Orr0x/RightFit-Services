import { Model } from '@nozbe/watermelondb'
import { field, readonly, date, children } from '@nozbe/watermelondb/decorators'

export default class Contractor extends Model {
  static table = 'contractors'
  static associations = {
    work_orders: { type: 'has_many' as const, foreignKey: 'contractor_id' },
  }

  @field('server_id') serverId!: string
  @field('tenant_id') tenantId!: string
  @field('name') name!: string
  @field('email') email?: string
  @field('phone') phone?: string
  @field('company_name') companyName?: string
  @field('trade') trade?: string
  @field('synced') synced!: boolean

  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @children('work_orders') workOrders: any
}
