import ApplicationError from './ApplicationError'

class NotImplementedError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Not implemented')
  }
}

export default NotImplementedError
