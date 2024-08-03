import ApplicationError from './ApplicationError'

class InvalidInputError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Invalid input')
  }
}

export default InvalidInputError
