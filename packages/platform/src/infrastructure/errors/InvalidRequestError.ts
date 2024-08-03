import ApplicationError from '../../application/errors/ApplicationError'

export class InvalidRequestError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Invalid request')
  }
}
