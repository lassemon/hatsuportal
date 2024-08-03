import { InputLimits } from '@hatsuportal/contracts'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { CommentBodyEmptyError } from '../errors/CommentBodyEmptyError'
import { CommentBodyTooLongError } from '../errors/CommentBodyTooLongError'

export class CommentBody extends NonEmptyString {
  constructor(raw: string) {
    if (typeof raw !== 'string') throw new CommentBodyEmptyError(`Value '${raw}' is not a valid comment body.`)

    const value = raw.trim()
    if (isNonStringOrEmpty(value)) throw new CommentBodyEmptyError(`Value '${raw}' is not a valid comment body.`)
    if (value.length > InputLimits.commentBody) {
      throw new CommentBodyTooLongError(`Comment body must be at most ${InputLimits.commentBody} characters.`)
    }

    super(value)
  }

  override equals(other: unknown): boolean {
    return other instanceof CommentBody && this.value === other.value
  }

  override toString(): string {
    return this.value
  }
}
