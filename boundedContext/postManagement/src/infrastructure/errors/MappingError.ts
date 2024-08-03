import InfrastructureError from './InfrastructureError'

export class MappingError extends InfrastructureError {
  constructor(message?: unknown) {
    super(message || 'Mapping error')
  }
}
