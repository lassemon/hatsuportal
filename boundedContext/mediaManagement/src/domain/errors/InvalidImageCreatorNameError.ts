import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidImageCreatorNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid image creator name')
  }
}
