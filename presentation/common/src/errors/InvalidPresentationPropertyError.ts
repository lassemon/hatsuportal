import { PresentationError } from './PresentationError'

export class InvalidPresentationPropertyError extends PresentationError {
  constructor(message?: unknown) {
    super(message || 'Invalid presentation property')
  }
}
