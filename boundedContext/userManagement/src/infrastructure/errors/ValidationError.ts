import InfrastructureError from './InfrastructureError'

export class ValidationError extends InfrastructureError {
  constructor(message?: string) {
    super(message)
  }
}
