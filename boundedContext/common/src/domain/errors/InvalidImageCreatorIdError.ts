import { InvalidUniqueIdError } from './InvalidUniqueIdError'

export class InvalidImageCreatorIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid image creator id')
  }
}
