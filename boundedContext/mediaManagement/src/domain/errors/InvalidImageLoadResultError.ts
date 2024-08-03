import { DomainError } from '@hatsuportal/foundation'

export class InvalidImageLoadResultError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid image load result')
  }
}
