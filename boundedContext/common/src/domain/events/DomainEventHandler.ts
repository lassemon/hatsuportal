import { DomainEvent } from './DomainEvent'

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>
}
