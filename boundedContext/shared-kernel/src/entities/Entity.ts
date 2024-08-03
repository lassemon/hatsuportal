import { IDomainEvent } from '../events'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { UniqueId } from '../valueObjects/UniqueId'

export interface EntityProps {
  readonly id: UniqueId
  readonly createdAt: UnixTimestamp
  updatedAt: UnixTimestamp
}

export abstract class Entity {
  protected _domainEvents: IDomainEvent<UnixTimestamp>[] = []
  protected _updatedAt: UnixTimestamp

  abstract delete(): void
  abstract equals(other: unknown): boolean
  abstract get domainEvents(): IDomainEvent<UnixTimestamp>[]
  abstract clearEvents(): void
  abstract addDomainEvent(event: IDomainEvent<UnixTimestamp>): void
  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  abstract serialize(): Record<string, unknown>

  constructor(public readonly id: UniqueId, public readonly createdAt: UnixTimestamp, updatedAt: UnixTimestamp) {
    if (createdAt.value > updatedAt.value) {
      throw new InvalidUnixTimestampError(
        `createdAt (${createdAt.value}) must be before updatedAt (${updatedAt.value})`
      )
    }
    this._updatedAt = updatedAt
  }

  get updatedAt(): UnixTimestamp {
    return this._updatedAt
  }
}
