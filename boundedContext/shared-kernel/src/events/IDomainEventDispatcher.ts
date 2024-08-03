import { IDomainEvent } from './IDomainEvent'
import { IDomainEventHandler } from './IDomainEventHandler'

export interface IDomainEventDispatcher<TTimeType = number> {
  register<T extends IDomainEvent<TTimeType>>(eventType: string, handler: IDomainEventHandler<T, TTimeType>): void
  dispatch(event: IDomainEvent<TTimeType>): Promise<void>
}
