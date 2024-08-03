import PresentationError from './PresentationError'

export class InvalidPresentationUserPropertyError extends PresentationError {
  constructor(message?: string) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
