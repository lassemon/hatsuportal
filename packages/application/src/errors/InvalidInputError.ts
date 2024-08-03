import ApplicationError from './ApplicationError'

export class InvalidInputError extends ApplicationError {
  constructor(message?: string) {
    super(message)
  }
}
