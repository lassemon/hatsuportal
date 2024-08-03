import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidMimeTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid mime type')
  }
}
