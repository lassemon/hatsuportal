import { isNumber, Logger } from '@hatsuportal/foundation'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import ValueObject from './ValueObject'

const logger = new Logger('UnixTimestamp')

interface CanCreateOptions {
  throwError?: boolean
}

export class UnixTimestamp extends ValueObject<number> {
  static canCreate(value: number, { throwError = false }: CanCreateOptions = {}) {
    try {
      new UnixTimestamp(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

  constructor(public readonly value: number) {
    super()

    const minTimestamp = 0
    // Max unix timestamp with a 32 bit INT is 2,147,483,647 seconds, which is 03:14:07 on Tuesday, 19 January 2038, see https://en.wikipedia.org/wiki/Year_2038_problem
    // this is why we use an unsigned BIGINT in the database, setting the max value of UnixTimestamp to be the Max value of Postgres BIGINT
    const maxTimestamp = 9223372036854775807
    const isBetween = value >= minTimestamp && value <= maxTimestamp

    if (!isNumber(value) || !value || !isBetween) throw new InvalidUnixTimestampError(`Value '${value}' is not a valid unix timestamp.`)

    this.value = Number(value.toFixed())
  }

  equals(other: unknown): boolean {
    return other instanceof UnixTimestamp && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
