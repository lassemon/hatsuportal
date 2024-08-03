import ApplicationError from './ApplicationError'

export class AuthenticationError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Authentication error')
  }
}
