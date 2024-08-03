import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidImageVersionIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid image version id')
  }
}
