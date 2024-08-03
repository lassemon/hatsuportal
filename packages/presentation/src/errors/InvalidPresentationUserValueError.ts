import PresentationError from './PresentationError'

export class InvalidPresentationUserValueError extends PresentationError {
  constructor(message?: string) {
    super(message)

    // Ensure the stack trace is properly captured for this error type
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
