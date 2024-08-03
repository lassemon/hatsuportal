import { ApplicationError } from '@hatsuportal/platform'

export class ValidationError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Validation error')
  }
}
