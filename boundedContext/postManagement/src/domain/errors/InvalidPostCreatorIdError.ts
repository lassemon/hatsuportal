import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidPostCreatorIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid post creator id')
  }
}
