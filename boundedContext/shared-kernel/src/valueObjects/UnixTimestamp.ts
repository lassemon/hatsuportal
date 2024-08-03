import { isNumber } from '@hatsuportal/common'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import ValueObject from './ValueObject'

/**
 * Whole seconds since the Unix epoch (1970-01-01T00:00:00Z).
 *
 * Constructing with a value that fails validation (for example not a number, zero, or outside the
 * allowed range) throws {@link InvalidUnixTimestampError}.
 *
 * The value `-1` is accepted only as the backing value of {@link UnixTimestamp.UNKNOWN}, a
 * sentinel meaning “no instant” rather than a real point in time.
 */
export class UnixTimestamp extends ValueObject<number> {
  /** Sentinel: `-1`. Not a valid epoch second; use when a neutral or unknown instant is required. */
  public static readonly UNKNOWN = new UnixTimestamp(-1)

  private _value: number

  static canCreate(value: number): boolean {
    try {
      UnixTimestamp.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: number): void {
    new UnixTimestamp(value)
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

    if (!isNumber(value) || !value || !isBetween) throw new InvalidUnixTimestampError(`Value '${value}' is not a valid unix timestamp.`)

    this._value = Number(value.toFixed())
  }

  equals(other: unknown): boolean {
    return other instanceof UnixTimestamp && this.value === other.value
  }

  subtractSeconds(seconds: number): UnixTimestamp {
    this._value = this._value - seconds
    return this
  }

  addSeconds(seconds: number): UnixTimestamp {
    this._value = this._value + seconds
    return this
  }

  toString(): string {
    return this.value.toString()
  }
}
