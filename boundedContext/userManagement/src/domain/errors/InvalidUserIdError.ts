import { InvalidUniqueIdError } from '@hatsuportal/common-bounded-context'

export class InvalidUserIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid user id')
  }
}
