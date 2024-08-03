import { DomainEvent, DomainEventHandler } from '@hatsuportal/domain'

export interface IDomainEventDispatcher {
  register<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): void
  dispatch(event: DomainEvent): Promise<void>
}
