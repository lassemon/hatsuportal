import ApplicationError from './ApplicationError'

export class AuthorizationError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Authorization error')
  }
}
