import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidTagSlugError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid tag slug')
  }
}
