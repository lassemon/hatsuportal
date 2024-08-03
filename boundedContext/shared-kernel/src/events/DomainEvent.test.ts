import { describe, expect, it } from 'vitest'
import { DomainEvent } from './DomainEvent'
import { DomainEventId } from '../valueObjects/DomainEventId'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'

class TestEvent extends DomainEvent<{ foo: string }> {
  constructor(data: { foo: string }, id?: DomainEventId, occurredOn?: UnixTimestamp) {
    super('TestEvent', data, id, occurredOn)
  }
}

describe('DomainEvent', () => {
  it('M6: preserves explicit id and occurredOn overrides for test doubles', () => {
    const eventId = new DomainEventId('123e4567-e89b-12d3-a456-426614174000')
    const occurredOn = new UnixTimestamp(1_727_290_472)
    const event = new TestEvent({ foo: 'bar' }, eventId, occurredOn)

    expect(event.id).toBe(eventId)
    expect(event.occurredOn).toBe(occurredOn)
    expect(event.eventType).toBe('TestEvent')
    expect(event.data).toEqual({ foo: 'bar' })
  })
})
