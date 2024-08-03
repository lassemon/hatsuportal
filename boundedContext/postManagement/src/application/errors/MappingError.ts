import { ApplicationError } from '@hatsuportal/foundation'

export class MappingError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Mapping error')
  }
}
