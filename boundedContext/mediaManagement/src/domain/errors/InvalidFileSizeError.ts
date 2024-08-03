import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidFileSizeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid file size')
  }
}
