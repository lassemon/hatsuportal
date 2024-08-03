import { IDomainEvent } from './IDomainEvent'

export interface IDomainEventHandler {
  handle(event: IDomainEvent): Promise<void>
}
