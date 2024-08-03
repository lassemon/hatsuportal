import { DomainEvent } from '../../domain/events/DomainEvent'
import { DomainEventHandler } from '../../domain/events/DomainEventHandler'

export interface IDomainEventDispatcher {
  register<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): void
  dispatch(event: DomainEvent): Promise<void>
}
