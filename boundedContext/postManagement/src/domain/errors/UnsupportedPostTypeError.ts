import { DomainError } from '@hatsuportal/common-bounded-context'

export class UnsupportedPostTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported post type')
  }
}
