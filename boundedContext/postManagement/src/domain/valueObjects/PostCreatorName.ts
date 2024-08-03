import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/common-bounded-context'
import { InvalidPostCreatorNameError } from '../errors/InvalidPostCreatorNameError'

const logger = new Logger('PostCreatorName')
export class PostCreatorName extends ValueObject<string> {
  static canCreate(value: string) {
    try {
      new PostCreatorName(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidPostCreatorNameError(`Value '${value}' is not a valid post creator name.`)
  }

  equals(other: unknown): boolean {
    return other instanceof PostCreatorName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
