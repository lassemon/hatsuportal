import InfrastructureError from './InfrastructureError'

export class ValidationError extends InfrastructureError {
  constructor(message?: unknown) {
    super(message || 'Validation error')
  }
}
