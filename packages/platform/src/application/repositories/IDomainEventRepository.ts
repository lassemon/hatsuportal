import { DomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventDatabaseSchema } from '../../infrastructure/schemas/DomainEventDatabaseSchema'

export interface IDomainEventRepository {
  insert(domainEvent: DomainEvent): Promise<void>
  findUnpublished(limit: number): Promise<DomainEventDatabaseSchema[]>
  markAsPublished(id: string, publishedOn: UnixTimestamp): Promise<void>
  deleteOlderThan(cutoffTimestamp: UnixTimestamp): Promise<number>
}
