import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidFileNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid file name')
  }
}
