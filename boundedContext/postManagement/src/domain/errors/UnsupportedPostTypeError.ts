import { DomainError } from '@hatsuportal/foundation'

export class UnsupportedPostTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported post type')
  }
}
