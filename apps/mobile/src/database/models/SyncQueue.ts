import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class SyncQueue extends Model {
  static table = 'sync_queue'

  @field('entity_type') entityType!: string
  @field('entity_id') entityId!: string
  @field('action') action!: string // 'create', 'update', 'delete'
  @field('payload') payload!: string // JSON string
  @field('attempts') attempts!: number
  @field('last_error') lastError?: string

  @readonly @date('created_at') createdAt!: Date
}
