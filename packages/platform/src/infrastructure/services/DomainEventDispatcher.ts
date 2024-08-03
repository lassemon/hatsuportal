import { IDomainEvent, IDomainEventDispatcher, IDomainEventHandler } from '@hatsuportal/shared-kernel'

export class DomainEventDispatcher implements IDomainEventDispatcher {
  private handlers: Map<string, IDomainEventHandler[]> = new Map()

  public register(eventType: string, handler: IDomainEventHandler): void {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler)
    this.handlers.set(eventType, handlers)
  }

  public async dispatch(event: IDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || []
    await Promise.all(handlers.map((handler) => handler.handle(event)))
  }
}
