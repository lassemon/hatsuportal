import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidUserIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid user id')
  }
}
