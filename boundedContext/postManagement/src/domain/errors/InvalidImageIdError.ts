import { InvalidUniqueIdError } from '@hatsuportal/common-bounded-context'

export class InvalidImageIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid image id')
  }
}
