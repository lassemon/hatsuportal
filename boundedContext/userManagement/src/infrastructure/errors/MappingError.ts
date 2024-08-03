import InfrastructureError from './InfrastructureError'

export class MappingError extends InfrastructureError {
  constructor(message?: string) {
    super(message)
  }
}
