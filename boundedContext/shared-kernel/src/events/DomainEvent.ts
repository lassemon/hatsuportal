import { toHumanReadableJson } from '@hatsuportal/common'
import { DomainEventId } from '../valueObjects/DomainEventId'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { IDomainEvent } from './IDomainEvent'

/**
 * The base class for all domain layer events. All domain events should subclass
 * this one to get automatic id and timestamp functionality.
 */
export class DomainEvent<TData = Record<string, unknown>> implements IDomainEvent<TData> {
  public readonly id: DomainEventId
  public readonly occurredOn: UnixTimestamp
  public readonly eventType: string
  public readonly data: TData

  constructor(eventType: string, data: TData, id?: DomainEventId, occurredOn?: UnixTimestamp) {
    this.id = id ?? DomainEventId.create()
    this.occurredOn = occurredOn ?? new UnixTimestamp()
    this.eventType = eventType
    this.data = data
  }

  toString(): string {
    return toHumanReadableJson(this.serialize())
  }

  protected serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      occurredOn: this.occurredOn.value,
      eventType: this.eventType,
      data: this.data
    }
  }
}
