import { DomainError } from '@hatsuportal/shared-kernel'

export class TagNameTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Tag name is too long')
  }
}
