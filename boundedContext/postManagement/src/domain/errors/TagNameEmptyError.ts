import { DomainError } from '@hatsuportal/shared-kernel'

export class TagNameEmptyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Tag name cannot be empty')
  }
}
