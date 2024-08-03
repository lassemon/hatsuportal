import { isNumber, unixtimeNow } from '@hatsuportal/common'
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

  constructor(public readonly value: number = unixtimeNow()) {
    super()

    if (value === -1) {
      this.value = value
      return
    }

    if (!isNumber(value) || value <= 0) throw new InvalidUnixTimestampError(`Value '${value}' is not a valid unix timestamp.`)

    const maxEpochSecond = 9999999999 // ~ year 2286; ms values from Date.now() are ~1e12+
    if (value > maxEpochSecond) {
      throw new InvalidUnixTimestampError(`Value '${value}' looks like milliseconds; UnixTimestamp expects epoch seconds.`)
    }

    this.value = Math.trunc(value)
  }

  equals(other: unknown): boolean {
    return other instanceof UnixTimestamp && this.value === other.value
  }

  subtractSeconds(seconds: number): UnixTimestamp {
    return new UnixTimestamp(this.value - seconds)
  }

  addSeconds(seconds: number): UnixTimestamp {
    return new UnixTimestamp(this.value + seconds)
  }

  toString(): string {
    return this.value.toString()
  }
}
