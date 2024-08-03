import ErrorFoundation from './ErrorFoundation'

class InvalidEnumValueError extends ErrorFoundation {
  constructor(message?: string) {
    super(message || 'Invalid enum value')
  }
}

export default InvalidEnumValueError
