import { ErrorFoundation } from './ErrorFoundation'

export class InvalidEnumValueError extends ErrorFoundation {
  constructor(message?: string) {
    super(message || 'Invalid enum value')
  }
}
