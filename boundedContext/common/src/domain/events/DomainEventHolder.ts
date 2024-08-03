import { UniqueId } from '../valueObjects/UniqueId'
import { DomainEvent } from './DomainEvent'

export interface DomainEventHolder {
  get domainEvents(): DomainEvent[]
  get id(): UniqueId
  addDomainEvent(event: DomainEvent): void
  clearEvents(): void
}
