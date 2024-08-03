import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidCoverImageIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid image id')
  }
}
