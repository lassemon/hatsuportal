import ApplicationError from './ApplicationError'

class ConflictError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Conflict')
  }
}

export default ConflictError
