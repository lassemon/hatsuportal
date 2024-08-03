import { InputLimits } from '@hatsuportal/contracts'
import { isString } from '@hatsuportal/common'
import { ValueObject } from '../../../../shared-kernel/src/valueObjects/ValueObject'
import { BioTooLongError } from '../errors/BioTooLongError'
import { InvalidBioError } from '../errors/InvalidBioError'

export class Bio extends ValueObject<string> {
  readonly value: string

  constructor(raw: string) {
    super()

    if (!isString(raw)) throw new InvalidBioError(`Value '${raw}' is not a valid bio.`)

    const trimmed = raw.trim()
    if (trimmed.length > InputLimits.bio) {
      throw new BioTooLongError(`Bio must be at most ${InputLimits.bio} characters.`)
    }

    this.value = trimmed
  }

  static empty(): Bio {
    return new Bio('')
  }

  equals(other: unknown): boolean {
    return other instanceof Bio && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
