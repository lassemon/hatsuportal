import { InvalidUniqueIdError } from './InvalidUniqueIdError'

export class InvalidImageIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid image id')
  }
}
