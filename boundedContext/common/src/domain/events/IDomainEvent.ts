import { UnixTimestamp } from '../valueObjects/UnixTimestamp'

export interface IDomainEvent {
  readonly occurredOn: UnixTimestamp
  readonly eventType: string
}
