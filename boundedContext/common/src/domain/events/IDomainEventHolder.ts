import { UniqueId } from '../valueObjects/UniqueId'
import { IDomainEvent } from './IDomainEvent'

export interface IDomainEventHolder {
  get domainEvents(): IDomainEvent[]
  get id(): UniqueId
  addDomainEvent(event: IDomainEvent): void
  clearEvents(): void
}
