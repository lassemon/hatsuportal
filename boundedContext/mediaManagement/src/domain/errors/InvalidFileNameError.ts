import { DomainError } from '@hatsuportal/foundation'

export class InvalidFileNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid file name')
  }
}
