import { InvalidUniqueIdError } from '@hatsuportal/common-bounded-context'

export class InvalidPostCreatorIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid post creator id')
  }
}
