import { describe, expect, it } from 'vitest'
import { DomainEvent, DomainEventId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventInfrastructureMapper } from './DomainEventInfrastructureMapper'

describe('DomainEventInfrastructureMapper', () => {
  const mapper = new DomainEventInfrastructureMapper()

  it('round-trips a domain event through the database schema', () => {
    const eventId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
    const original = new DomainEvent(
      'StoryCreated',
      { storyId: 'story-1', title: 'Hello' },
      new DomainEventId(eventId),
      new UnixTimestamp(1_700_000_000)
    )

    const record = mapper.toInsertRecord(original)

    expect(record).toEqual({
      id: eventId,
      eventType: 'StoryCreated',
      serializedEventData: JSON.stringify({ storyId: 'story-1', title: 'Hello' }),
      occurredOn: 1_700_000_000,
      publishedOn: null
    })

    const restored = mapper.toDomainEvent(record)

    expect(restored.eventType).toBe(original.eventType)
    expect(restored.data).toEqual(original.data)
    expect(restored.id.value).toBe(original.id.value)
    expect(restored.occurredOn.value).toBe(original.occurredOn.value)
  })
})
