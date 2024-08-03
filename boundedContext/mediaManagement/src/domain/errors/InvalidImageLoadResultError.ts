import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidImageLoadResultError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid image load result')
  }
}
