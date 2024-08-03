import { InfrastructureError } from './InfrastructureError'

export class InvalidViewModelPropertyError extends InfrastructureError {
  constructor(message?: unknown) {
    super(message || 'Invalid view model property')
  }
}
