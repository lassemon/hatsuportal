import { DomainEvent, IDomainEventHolder } from '@hatsuportal/shared-kernel'

export function flattenDomainEventsFromHolders(holders: Iterable<IDomainEventHolder | null>): DomainEvent[] {
  return [...holders]
    .filter((holder): holder is IDomainEventHolder => holder !== null)
    .flatMap((holder) => holder.domainEvents)
}
