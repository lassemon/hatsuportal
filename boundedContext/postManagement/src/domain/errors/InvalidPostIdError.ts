import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidPostIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid post id')
  }
}
