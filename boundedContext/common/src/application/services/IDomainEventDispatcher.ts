import { IDomainEvent } from '../../domain/events/IDomainEvent'
import { IDomainEventHandler } from '../../domain/events/IDomainEventHandler'

export interface IDomainEventDispatcher {
  register<T extends IDomainEvent>(eventType: string, handler: IDomainEventHandler<T>): void
  dispatch(event: IDomainEvent): Promise<void>
}
