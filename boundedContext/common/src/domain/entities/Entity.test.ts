import { describe, it, expect } from 'vitest'
import { Entity, EntityProps } from './Entity'
import { unixtimeNow } from '@hatsuportal/common'
import { IDomainEvent } from '../events/IDomainEvent'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'

class TestEvent implements IDomainEvent {
  readonly eventType = 'TestEvent'
  readonly occurredOn: UnixTimestamp

  constructor() {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

class TestEntity extends Entity<EntityProps> {
  private _domainEvents: IDomainEvent[] = []

  getProps(): EntityProps {
    return {
      id: 'test-123',
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt.value
    }
  }

  update(props: Partial<EntityProps>): void {
    // Implementation not needed for test
  }

  delete(): void {
    // Implementation not needed for test
  }

  equals(other: unknown): boolean {
    return other instanceof TestEntity && this._createdAt.equals(other._createdAt) && this._updatedAt.equals(other._updatedAt)
  }

  get domainEvents(): IDomainEvent[] {
    return [...this._domainEvents]
  }

  clearEvents(): void {
    this._domainEvents = []
  }

  addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event)
  }
}

describe('Entity', () => {
  const now = unixtimeNow()
  const validProps = {
    id: 'test-123',
    createdAt: now,
    updatedAt: now + 1000
  }

  it('creates an entity with valid properties', () => {
    const entity = new TestEntity(validProps)
    expect(entity.getProps()).toEqual(validProps)
  })

  it('throws error if createdAt is after updatedAt', () => {
    const invalidProps = {
      ...validProps,
      createdAt: now + 2000,
      updatedAt: now + 1000
    }

    expect(() => new TestEntity(invalidProps)).toThrow('createdAt must be before updatedAt')
  })

  it('handles domain events correctly', () => {
    const entity = new TestEntity(validProps)
    const event = new TestEvent()

    entity.addDomainEvent(event)
    expect(entity.domainEvents).toHaveLength(1)
    expect(entity.domainEvents[0]).toBe(event)

    entity.clearEvents()
    expect(entity.domainEvents).toHaveLength(0)
  })

  it('checks equality correctly', () => {
    const entity1 = new TestEntity(validProps)
    const entity2 = new TestEntity(validProps)
    const entity3 = new TestEntity({
      ...validProps,
      id: 'test-456',
      createdAt: now + 1000
    })

    expect(entity1.equals(entity2)).toBe(true)
    expect(entity1.equals(entity3)).toBe(false)
    expect(entity1.equals({})).toBe(false)
  })

  it('returns immutable domain events array', () => {
    const entity = new TestEntity(validProps)
    const event = new TestEvent()
    entity.addDomainEvent(event)

    const events = entity.domainEvents
    events.push(new TestEvent())

    expect(entity.domainEvents).toHaveLength(1)
  })
})
