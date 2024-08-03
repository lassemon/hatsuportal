import { UnixTimestamp } from '../valueObjects'

export interface IDomainEvent<TData = Record<string, unknown>> {
  readonly occurredOn: UnixTimestamp
  readonly eventType: string
  data: TData
}
