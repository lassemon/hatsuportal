import PresentationError from './PresentationError'

export class InvalidPresentationPostValueError extends PresentationError {
  constructor(message?: string) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
