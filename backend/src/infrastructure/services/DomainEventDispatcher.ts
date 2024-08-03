import { DomainEvent, DomainEventHandler } from '@hatsuportal/common-bounded-context'
import { IDomainEventDispatcher } from '@hatsuportal/common-bounded-context'

export class DomainEventDispatcher implements IDomainEventDispatcher {
  private handlers: Map<string, DomainEventHandler<DomainEvent>[]> = new Map()

  public register<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): void {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler)
    this.handlers.set(eventType, handlers)
  }

  public async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || []
    await Promise.all(handlers.map((handler) => handler.handle(event)))
  }
}
