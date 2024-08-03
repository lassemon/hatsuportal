import { PresentationError } from './PresentationError'

export class InvalidRequestError extends PresentationError {
  constructor(message?: unknown) {
    super(message || 'Invalid request')
  }
}
