import { describe, it, expect } from 'vitest'
import { Entity } from './Entity'
import { DomainEvent } from '../events'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { UniqueId } from '../valueObjects/UniqueId'
import { CreatedAtTimestamp } from '../valueObjects'
import { InvalidCreatedAtTimestampError } from '../errors/InvalidCreatedAtTimestampError'
import { unixtimeNow } from '@hatsuportal/common'

const sampleId = new UniqueId('test1b19-entity-4792-a2f0-f95ccab82d92')
const sampleCreatedAt = new CreatedAtTimestamp(unixtimeNow() - 1000)
const sampleUpdatedAt = new UnixTimestamp(unixtimeNow() + 1200)

class TestEvent extends DomainEvent {
  constructor() {
    super('TestEvent', {})
  }
}

class TestEntity extends Entity {
  constructor(id: UniqueId, createdAt: CreatedAtTimestamp, updatedAt: UnixTimestamp) {
    super(id, createdAt, updatedAt)
  }

  delete(): void {
    // Implementation not needed for test
  }

  equals(other: unknown): boolean {
    return (
      other instanceof TestEntity &&
      this.id.equals(other.id) &&
      this.createdAt.equals(other.createdAt) &&
      this.updatedAt.equals(other.updatedAt)
    )
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents]
  }

  clearEvents(): void {
    this._domainEvents = []
  }

  addDomainEvent(event: DomainEvent): void {
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

  it('throws when valid past createdAt is after valid past updatedAt', () => {
    const createdAt = new CreatedAtTimestamp(unixtimeNow() - 100)
    const updatedAt = new UnixTimestamp(unixtimeNow() - 500)

    expect(() => new TestEntity(sampleId, createdAt, updatedAt)).toThrow(InvalidCreatedAtTimestampError)
  })

  // TODO, replace updatedAt and createdAt with a new NonFutureDate VO
  it('allows UnixTimestamp.UNKNOWN as updatedAt', () => {
    const createdAt = new CreatedAtTimestamp(unixtimeNow() - 100)

    expect(() => new TestEntity(sampleId, createdAt, UnixTimestamp.UNKNOWN)).not.toThrow()
    expect(createdAt.value).toBeGreaterThan(UnixTimestamp.UNKNOWN.value)
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
    const entityWithDifferentId = new TestEntity(new UniqueId('test2b19-entity-4792-a2f0-f95ccab82d93'), sampleCreatedAt, sampleUpdatedAt)
    const entityWithDifferentCreatedAt = new TestEntity(sampleId, new CreatedAtTimestamp(sampleCreatedAt.value + 1000), sampleUpdatedAt)
    const entityWithDifferentUpdatedAt = new TestEntity(sampleId, sampleCreatedAt, new UnixTimestamp(sampleUpdatedAt.value + 1000))

    expect(entity1.equals(entity2)).toBe(true)
    expect(entity1.equals(entityWithDifferentId)).toBe(false)
    expect(entity1.equals(entityWithDifferentCreatedAt)).toBe(false)
    expect(entity1.equals(entityWithDifferentUpdatedAt)).toBe(false)
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
