import ApplicationError from './ApplicationError'

class NotFoundError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Not found')
  }
}

export default NotFoundError
