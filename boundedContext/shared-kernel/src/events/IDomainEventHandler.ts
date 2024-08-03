import { IDomainEvent } from './IDomainEvent'

export interface IDomainEventHandler<T extends IDomainEvent<TTimeType>, TTimeType = number> {
  handle(event: T): Promise<void>
}
