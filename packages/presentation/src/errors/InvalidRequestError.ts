import PresentationError from './PresentationError'

export class InvalidRequestError extends PresentationError {
  constructor(message?: string) {
    super(message)
  }
}
