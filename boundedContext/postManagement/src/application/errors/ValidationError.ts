import { ApplicationError } from '@hatsuportal/foundation'

export class ValidationError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Validation error')
  }
}
