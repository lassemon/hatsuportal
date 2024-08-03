import { IDomainEvent, IDomainEventDispatcher, IDomainEventHandler, UnixTimestamp } from '@hatsuportal/shared-kernel'

export class DomainEventDispatcher implements IDomainEventDispatcher<UnixTimestamp> {
  private handlers: Map<string, IDomainEventHandler<IDomainEvent<UnixTimestamp>, UnixTimestamp>[]> = new Map()

  public register<T extends IDomainEvent<UnixTimestamp>>(eventType: string, handler: IDomainEventHandler<T, UnixTimestamp>): void {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler)
    this.handlers.set(eventType, handlers)
  }

  public async dispatch(event: IDomainEvent<UnixTimestamp>): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || []
    await Promise.all(handlers.map((handler) => handler.handle(event)))
  }
}
