import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidCssColorError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid CSS color')
  }
}
