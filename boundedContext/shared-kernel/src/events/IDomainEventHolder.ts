import { IDomainEvent } from './IDomainEvent'

export interface IDomainEventHolder<IdType = string, TTimeType = number> {
  get domainEvents(): IDomainEvent<TTimeType>[]
  get id(): IdType
  addDomainEvent(event: IDomainEvent<TTimeType>): void
  clearEvents(): void
}
