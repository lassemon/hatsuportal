import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidCommentAuthorIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid comment author id')
  }
}
