import { InputLimits } from '@hatsuportal/contracts'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { StoryBodyEmptyError } from '../errors/StoryBodyEmptyError'
import { StoryBodyTooLongError } from '../errors/StoryBodyTooLongError'

export class StoryBody extends NonEmptyString {
  constructor(raw: string) {
    if (typeof raw !== 'string') throw new StoryBodyEmptyError(`Value '${raw}' is not a valid story body.`)

    const value = raw.trim()
    if (isNonStringOrEmpty(value)) throw new StoryBodyEmptyError(`Value '${raw}' is not a valid story body.`)
    if (value.length > InputLimits.storyBody) {
      throw new StoryBodyTooLongError(`Story body must be at most ${InputLimits.storyBody} characters.`)
    }

    super(value)
  }

  override equals(other: unknown): boolean {
    return other instanceof StoryBody && this.value === other.value
  }

  override toString(): string {
    return this.value
  }
}
