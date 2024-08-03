export interface IDomainEvent<TTime, TData = Record<string, unknown>> {
  readonly occurredOn: TTime
  readonly eventType: string
  data: TData
}
