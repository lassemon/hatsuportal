import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IDomainEventHolder } from '@hatsuportal/shared-kernel'
import { UniqueId } from '@hatsuportal/shared-kernel'

export interface IDomainEventService {
  persistToOutbox<T extends Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>>(eventHolders: [...T]): Promise<void>
  persistToOutbox<DomainEvent extends IDomainEvent<UnixTimestamp>>(domainEvents: DomainEvent[]): Promise<void>
}
