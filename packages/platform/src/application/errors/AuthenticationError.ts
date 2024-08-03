import ApplicationError from './ApplicationError'

class AuthenticationError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Authentication error')
  }
}

export default AuthenticationError
