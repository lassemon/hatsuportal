import { UnixTimestamp } from '../valueObjects/UnixTimestamp'

export interface DomainEvent {
  readonly occurredOn: UnixTimestamp
  readonly eventType: string
}
