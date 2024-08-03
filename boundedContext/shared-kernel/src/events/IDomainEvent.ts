export interface IDomainEvent<TTime> {
  readonly occurredOn: TTime
  readonly eventType: string
}
