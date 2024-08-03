import { DomainError } from '@hatsuportal/shared-kernel'

export class BioTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Bio is too long')
  }
}
