import { isNumber, Logger } from '@hatsuportal/common'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import ValueObject from './ValueObject'

const logger = new Logger('UnixTimestamp')
export class UnixTimestamp extends ValueObject<number> {
  static canCreate(value: number) {
    try {
      new UnixTimestamp(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: number) {
    super()

    const minTimestamp = 0
    // Max unix timestamp with a 32 bit INT is 2,147,483,647 seconds, which is 03:14:07 on Tuesday, 19 January 2038, see https://en.wikipedia.org/wiki/Year_2038_problem
    // this is why we use an unsigned BIGINT in the database, setting the max value of UnixTimestamp to be the Max value of MariaDB BIGINT
    const maxTimestamp = 9223372036854775807
    const isBetween = _value >= minTimestamp && _value <= maxTimestamp

    if (!isNumber(_value) || !_value || !isBetween) throw new InvalidUnixTimestampError(`Value '${_value}' is not a valid unix timestamp.`)

    this._value = Number(_value.toFixed())
  }

  get value(): number {
    return this._value
  }

  equals(other: unknown): boolean {
    return other instanceof UnixTimestamp && this._value === other.value
  }

  toString(): string {
    return this._value.toString()
  }
}
