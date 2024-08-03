import { IDomainEvent } from './IDomainEvent'
import { IDomainEventHandler } from './IDomainEventHandler'

export interface IDomainEventDispatcher {
  register(eventType: string, handler: IDomainEventHandler): void
  dispatch(event: IDomainEvent): Promise<void>
}
