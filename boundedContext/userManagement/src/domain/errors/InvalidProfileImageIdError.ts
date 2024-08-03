import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidProfileImageIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid profile image id')
  }
}
