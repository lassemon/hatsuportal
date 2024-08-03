import { DomainError } from '@hatsuportal/foundation'

export class InvalidTagSlugError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid tag slug')
  }
}
