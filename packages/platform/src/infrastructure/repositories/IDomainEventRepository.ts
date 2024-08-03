import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventDatabaseSchema } from '../schemas/DomainEventDatabaseSchema'

export interface IDomainEventRepository {
  insert(domainEvent: IDomainEvent<UnixTimestamp>): Promise<void>
  findUnpublished(limit: number): Promise<DomainEventDatabaseSchema[]>
  markAsPublished(id: string, publishedOn: UnixTimestamp): Promise<void>
  deleteOlderThan(cutoffTimestamp: UnixTimestamp): Promise<number>
}
