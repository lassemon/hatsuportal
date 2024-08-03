import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidImageIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid image id')
  }
}
