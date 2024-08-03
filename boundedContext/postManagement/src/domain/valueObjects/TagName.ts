import { InputLimits } from '@hatsuportal/contracts'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { TagNameEmptyError } from '../errors/TagNameEmptyError'
import { TagNameTooLongError } from '../errors/TagNameTooLongError'

export class TagName extends NonEmptyString {
  constructor(raw: string) {
    if (typeof raw !== 'string') throw new TagNameEmptyError(`Value '${raw}' is not a valid tag name.`)

    const value = raw.trim()
    if (isNonStringOrEmpty(value)) throw new TagNameEmptyError(`Value '${raw}' is not a valid tag name.`)
    if (value.length > InputLimits.tagName) {
      throw new TagNameTooLongError(`Tag name must be at most ${InputLimits.tagName} characters.`)
    }

    super(value)
  }

  override equals(other: unknown): boolean {
    return other instanceof TagName && this.value === other.value
  }

  override toString(): string {
    return this.value
  }
}
