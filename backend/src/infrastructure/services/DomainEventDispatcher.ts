import { IDomainEvent, IDomainEventHandler } from '@hatsuportal/common-bounded-context'
import { IDomainEventDispatcher } from '@hatsuportal/common-bounded-context'

export class DomainEventDispatcher implements IDomainEventDispatcher {
  private handlers: Map<string, IDomainEventHandler<IDomainEvent>[]> = new Map()

  public register<T extends IDomainEvent>(eventType: string, handler: IDomainEventHandler<T>): void {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler)
    this.handlers.set(eventType, handlers)
  }

  public async dispatch(event: IDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || []
    await Promise.all(handlers.map((handler) => handler.handle(event)))
  }
}
