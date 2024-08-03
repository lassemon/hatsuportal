import { InputLimits } from '@hatsuportal/contracts'
import { isString } from '@hatsuportal/common'
import { ValueObject } from '../../../../shared-kernel/src/valueObjects/ValueObject'
import { StatusMessageTooLongError } from '../errors/StatusMessageTooLongError'
import { InvalidStatusMessageError } from '../errors/InvalidStatusMessageError'

export class StatusMessage extends ValueObject<string> {
  readonly value: string

  constructor(raw: string) {
    super()

    if (!isString(raw)) throw new InvalidStatusMessageError(`Value '${raw}' is not a valid status message.`)

    const trimmed = raw.trim()
    if (trimmed.length > InputLimits.statusMessage) {
      throw new StatusMessageTooLongError(`Status message must be at most ${InputLimits.statusMessage} characters.`)
    }

    this.value = trimmed
  }

  static empty(): StatusMessage {
    return new StatusMessage('')
  }

  equals(other: unknown): boolean {
    return other instanceof StatusMessage && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
