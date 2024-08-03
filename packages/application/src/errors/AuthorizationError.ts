import ApplicationError from './ApplicationError'

export class AuthorizationError extends ApplicationError {
  constructor(message?: string) {
    super(message)
  }
}
