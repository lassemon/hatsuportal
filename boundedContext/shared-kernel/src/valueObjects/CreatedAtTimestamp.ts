import { isNumber } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidCreatedAtTimestampError } from '../errors/InvalidCreatedAtTimestampError'
import { UnixTimestamp } from './UnixTimestamp' // importing for jsdoc reference
import { unixtimeNow } from '@hatsuportal/common'

/**
 * Seconds since the Unix epoch when an aggregate or record was first persisted.
 *
 * This type exists so the domain can distinguish **creation time**
 * from any other instant (e.g. `updatedAt`, domain event `occurredOn`).
 * Positive epoch seconds (> 0, <= max), rejects zero and negative values
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

    // Max unix timestamp with a 32 bit INT is 2,147,483,647 seconds, which is 03:14:07 on Tuesday, 19 January 2038, see https://en.wikipedia.org/wiki/Year_2038_problem
    // this is why we use an unsigned BIGINT in the database, setting the max value of UnixTimestamp to be the Max value of Postgres BIGINT
    if (!isNumber(value) || value <= 0) {
      throw new InvalidCreatedAtTimestampError(`Value '${value}' is not a number.`)
    }
    const maxEpochSecond = 9999999999 // ~ year 2286; ms values from Date.now() are ~1e12+
    if (value > maxEpochSecond) {
      throw new InvalidCreatedAtTimestampError(`Value '${value}' looks like milliseconds; CreatedAtTimestamp expects epoch seconds.`)
    }

    if (value > unixtimeNow()) throw new InvalidCreatedAtTimestampError(`Value '${value}' is in the future.`)

    this.value = Math.trunc(value)
  }

  equals(other: unknown): boolean {
    return other instanceof CreatedAtTimestamp && this.value === other.value
  }

  subtractSeconds(seconds: number): CreatedAtTimestamp {
    return new CreatedAtTimestamp(this.value - seconds)
  }

  addSeconds(seconds: number): CreatedAtTimestamp {
    return new CreatedAtTimestamp(this.value + seconds)
  }

  toString(): string {
    return this.value.toString()
  }
}
