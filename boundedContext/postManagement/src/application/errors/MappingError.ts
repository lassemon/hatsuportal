import { ApplicationError } from '@hatsuportal/platform'

export class MappingError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Mapping error')
  }
}
