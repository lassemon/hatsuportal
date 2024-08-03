import ApplicationError from './ApplicationError'

class ForbiddenError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Forbidden error')
  }
}

export default ForbiddenError
