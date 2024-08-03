import { IDomainEvent } from './IDomainEvent'

export interface IDomainEventHandler<T extends IDomainEvent> {
  handle(event: T): Promise<void>
}
