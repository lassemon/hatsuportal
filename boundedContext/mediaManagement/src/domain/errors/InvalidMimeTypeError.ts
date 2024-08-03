import { DomainError } from '@hatsuportal/foundation'

export class InvalidMimeTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid mime type')
  }
}
