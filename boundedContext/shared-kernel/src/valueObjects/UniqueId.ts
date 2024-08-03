import { isNonStringOrEmpty } from '@hatsuportal/common'
import { ValueObject } from './ValueObject'
import { InvalidUniqueIdError } from '../errors/InvalidUniqueIdError'

export class UniqueId extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      UniqueId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new UniqueId(value)
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidUniqueIdError(`Value '${value}' is not a valid unique id for ${this.constructor.name}.`)

    // 36 characters is the uuid v4 standard length
    if (value.length < 36) throw new InvalidUniqueIdError(`Value '${value}' is too short.`)
  }

  equals(other: unknown): boolean {
    return other instanceof UniqueId && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
