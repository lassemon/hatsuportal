import ApplicationError from './ApplicationError'

export class InvalidInputError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Invalid input')
  }
}
