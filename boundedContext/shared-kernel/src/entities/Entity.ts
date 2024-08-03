import { DomainEvent } from '../events'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { UniqueId } from '../valueObjects/UniqueId'
import { CreatedAtTimestamp } from '../valueObjects'
import { InvalidCreatedAtTimestampError } from '../errors/InvalidCreatedAtTimestampError'

export interface EntityProps {
  readonly id: UniqueId
  readonly createdAt: CreatedAtTimestamp
  updatedAt: UnixTimestamp
}

export abstract class Entity {
  protected _domainEvents: DomainEvent[] = []
  protected _updatedAt: UnixTimestamp

  abstract delete(deletedById: UniqueId): void
  abstract equals(other: unknown): boolean
  abstract get domainEvents(): DomainEvent[]
  abstract clearEvents(): void
  abstract addDomainEvent(event: DomainEvent): void
  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  abstract serialize(): Record<string, unknown>

  constructor(
    public readonly id: UniqueId,
    public readonly createdAt: CreatedAtTimestamp,
    updatedAt: UnixTimestamp
  ) {
    if (createdAt.value > updatedAt.value && !updatedAt.equals(UnixTimestamp.UNKNOWN)) {
      throw new InvalidCreatedAtTimestampError(`createdAt (${createdAt.value}) must be before updatedAt (${updatedAt.value})`)
    }
    this._updatedAt = updatedAt
  }

  get updatedAt(): UnixTimestamp {
    return this._updatedAt
  }
}
