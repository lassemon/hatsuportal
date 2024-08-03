import CommonError from './CommonError'

export class InvalidEnumValueError extends CommonError {
  constructor(message?: string) {
    super(message)
  }
}
