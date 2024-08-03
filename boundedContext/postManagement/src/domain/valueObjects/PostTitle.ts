import { InputLimits } from '@hatsuportal/contracts'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { PostTitleEmptyError } from '../errors/PostTitleEmptyError'
import { PostTitleTooLongError } from '../errors/PostTitleTooLongError'

export class PostTitle extends NonEmptyString {
  constructor(raw: string) {
    if (typeof raw !== 'string') throw new PostTitleEmptyError(`Value '${raw}' is not a valid post title.`)

    const value = raw.trim()
    if (isNonStringOrEmpty(value)) throw new PostTitleEmptyError(`Value '${raw}' is not a valid post title.`)
    if (value.length > InputLimits.postTitle) {
      throw new PostTitleTooLongError(`Post title must be at most ${InputLimits.postTitle} characters.`)
    }

    super(value)
  }

  override equals(other: unknown): boolean {
    return other instanceof PostTitle && this.value === other.value
  }

  override toString(): string {
    return this.value
  }
}
