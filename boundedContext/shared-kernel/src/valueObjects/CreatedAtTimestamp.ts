import { isNumber } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidCreatedAtTimestampError } from '../errors/InvalidCreatedAtTimestampError'
import { UnixTimestamp } from './UnixTimestamp' // importing for jsdoc reference

/**
 * Seconds since the Unix epoch when an aggregate or record was first persisted.
 *
 * Same numeric rules as {@link UnixTimestamp} (non-zero, bounded range; `-1`),
 * but this type exists so the domain can distinguish * **creation time**
 * from any other instant (e.g. `updatedAt`, domain event `occurredOn`).
 *
 * That separation gives clearer ubiquitous language, type-checked APIs (you cannot pass a generic
 * {@link UnixTimestamp} where creation time is required without an explicit mapping), and
 * {@link InvalidCreatedAtTimestampError} instead of a generic invalid-timestamp error.
 *
 * Unlike {@link UnixTimestamp}, this type does not expose `UNKNOWN`: creation time is modeled as
 * defined whenever an entity exists; use {@link UnixTimestamp} when you need a sentinel such as
 * {@link UnixTimestamp.UNKNOWN}.
 *
 * @see UnixTimestamp
 */
export class CreatedAtTimestamp extends ValueObject<number> {
  private _value: number
  static canCreate(value: number): boolean {
    try {
      CreatedAtTimestamp.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: number): void {
    new CreatedAtTimestamp(value)
  }

  constructor(public readonly value: number) {
    super()

    if (value === -1) {
      this._value = value
      return
    }

    const minTimestamp = 0
    // Max unix timestamp with a 32 bit INT is 2,147,483,647 seconds, which is 03:14:07 on Tuesday, 19 January 2038, see https://en.wikipedia.org/wiki/Year_2038_problem
    // this is why we use an unsigned BIGINT in the database, setting the max value of UnixTimestamp to be the Max value of Postgres BIGINT
    const maxTimestamp = 9223372036854775807
    const isBetween = value >= minTimestamp && value <= maxTimestamp

    if (!isNumber(value) || !value || !isBetween)
      throw new InvalidCreatedAtTimestampError(`Value '${value}' is not a valid unix timestamp.`)

    this._value = Number(value.toFixed())
  }

  equals(other: unknown): boolean {
    return other instanceof CreatedAtTimestamp && this.value === other.value
  }

  subtractSeconds(seconds: number): CreatedAtTimestamp {
    this._value = this._value - seconds
    return this
  }

  addSeconds(seconds: number): CreatedAtTimestamp {
    this._value = this._value + seconds
    return this
  }

  toString(): string {
    return this.value.toString()
  }
}
