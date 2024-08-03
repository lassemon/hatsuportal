import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidCommentIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid comment id')
  }
}
