import { InfrastructureError } from './InfrastructureError'

export class InvalidRequestError extends InfrastructureError {
  constructor(message?: unknown) {
    super(message || 'Invalid request')
  }
}
