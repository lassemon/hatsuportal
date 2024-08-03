import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import { IDomainEvent } from '../events/IDomainEvent'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'

export interface EntityProps {
  readonly id: string
  readonly createdAt: number
  updatedAt: number
}

export abstract class Entity<E extends EntityProps> {
  protected _createdAt: UnixTimestamp
  protected _updatedAt: UnixTimestamp

  abstract getProps(): EntityProps
  abstract update(props: Partial<E>): void
  abstract delete(): void
  abstract equals(other: unknown): boolean
  abstract get domainEvents(): IDomainEvent[]
  abstract clearEvents(): void
  abstract addDomainEvent(event: IDomainEvent): void

  constructor(props: E) {
    if (props.createdAt > props.updatedAt) {
      throw new InvalidUnixTimestampError('createdAt must be before updatedAt')
    }

    this._createdAt = new UnixTimestamp(props.createdAt)
    this._updatedAt = new UnixTimestamp(props.updatedAt)
  }
}
