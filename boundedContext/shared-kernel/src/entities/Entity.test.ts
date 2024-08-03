import { describe, it, expect } from 'vitest'
import { Entity } from './Entity'
import { IDomainEvent } from '../events'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { UniqueId } from '../valueObjects/UniqueId'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'

const unixtimeNow = () => Math.floor(Date.now() / 1000)

const sampleId = new UniqueId('test1b19-entity-4792-a2f0-f95ccab82d92')
const sampleCreatedAt = new UnixTimestamp(unixtimeNow())
const sampleUpdatedAt = new UnixTimestamp(unixtimeNow() + 1000)

class TestEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'TestEvent'
  readonly occurredOn: UnixTimestamp

  constructor() {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

class TestEntity extends Entity {
  constructor(id: UniqueId, createdAt: UnixTimestamp, updatedAt: UnixTimestamp) {
    super(id, createdAt, updatedAt)
  }

  delete(): void {
    // Implementation not needed for test
  }

  equals(other: unknown): boolean {
    return other instanceof TestEntity && this.createdAt.equals(other.createdAt) && this.updatedAt.equals(other.updatedAt)
  }

  get domainEvents(): IDomainEvent<UnixTimestamp>[] {
    return [...this._domainEvents]
  }

  clearEvents(): void {
    this._domainEvents = []
  }

  addDomainEvent(event: IDomainEvent<UnixTimestamp>): void {
    this._domainEvents.push(event)
  }

  serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value
    }
  }
}

describe('Entity', () => {
  it('creates an entity with valid properties', () => {
    const entity = new TestEntity(sampleId, sampleCreatedAt, sampleUpdatedAt)
    expect(entity.id.value).toEqual(sampleId.value)
    expect(entity.createdAt.value).toEqual(sampleCreatedAt.value)
    expect(entity.updatedAt.value).toEqual(sampleUpdatedAt.value)
  })

  it('throws error if createdAt is after updatedAt', () => {
    expect(() => new TestEntity(sampleId, new UnixTimestamp(unixtimeNow() + 2000), new UnixTimestamp(unixtimeNow() + 1000))).toThrow(
      InvalidUnixTimestampError
    )
  })

  it('handles domain events correctly', () => {
    const entity = new TestEntity(sampleId, sampleCreatedAt, sampleUpdatedAt)
    const event = new TestEvent()

    entity.addDomainEvent(event)
    expect(entity.domainEvents).toHaveLength(1)
    expect(entity.domainEvents[0]).toBe(event)

    entity.clearEvents()
    expect(entity.domainEvents).toHaveLength(0)
  })

  it('checks equality correctly', () => {
    const entity1 = new TestEntity(sampleId, sampleCreatedAt, sampleUpdatedAt)
    const entity2 = new TestEntity(sampleId, sampleCreatedAt, sampleUpdatedAt)
    const entity3 = new TestEntity(
      new UniqueId('test2b19-entity-4792-a2f0-f95ccab82d92'),
      new UnixTimestamp(unixtimeNow() + 1000),
      sampleUpdatedAt
    )

    expect(entity1.equals(entity2)).toBe(true)
    expect(entity1.equals(entity3)).toBe(false)
    expect(entity1.equals({})).toBe(false)
  })

  it('returns immutable domain events array', () => {
    const entity = new TestEntity(sampleId, sampleCreatedAt, sampleUpdatedAt)
    const event = new TestEvent()
    entity.addDomainEvent(event)

    const events = entity.domainEvents
    events.push(new TestEvent())

    expect(entity.domainEvents).toHaveLength(1)
  })
})
