import { DomainError } from '@hatsuportal/shared-kernel'

export class UnsupportedPostTypeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Unsupported post type')
  }
}
