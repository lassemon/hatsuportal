import ApplicationError from './ApplicationError'

class AuthorizationError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Authorization error')
  }
}

export default AuthorizationError
