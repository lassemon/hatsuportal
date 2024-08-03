import { isNumber } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidCreatedAtTimestampError } from '../errors/InvalidCreatedAtTimestampError'

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

    if (value === -1) {
      this.value = value
      return
    }

    const minTimestamp = 0
    // Max unix timestamp with a 32 bit INT is 2,147,483,647 seconds, which is 03:14:07 on Tuesday, 19 January 2038, see https://en.wikipedia.org/wiki/Year_2038_problem
    // this is why we use an unsigned BIGINT in the database, setting the max value of UnixTimestamp to be the Max value of Postgres BIGINT
    const maxTimestamp = 9223372036854775807
    const isBetween = value >= minTimestamp && value <= maxTimestamp

    if (!isNumber(value) || !value || !isBetween)
      throw new InvalidCreatedAtTimestampError(`Value '${value}' is not a valid unix timestamp.`)

    this.value = Number(value.toFixed())
  }

  equals(other: unknown): boolean {
    return other instanceof CreatedAtTimestamp && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
