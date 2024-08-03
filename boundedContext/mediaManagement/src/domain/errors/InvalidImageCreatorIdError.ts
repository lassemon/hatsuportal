import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidImageCreatorIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid image creator id')
  }
}
