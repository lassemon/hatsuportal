import { InvalidUniqueIdError } from '@hatsuportal/common-bounded-context'

export class InvalidPostIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid post id')
  }
}
