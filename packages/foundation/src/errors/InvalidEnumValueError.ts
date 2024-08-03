import ApplicationError from './ApplicationError'

class InvalidEnumValueError extends ApplicationError {
  constructor(message?: string) {
    super(message || 'Invalid enum value')
  }
}

export default InvalidEnumValueError
