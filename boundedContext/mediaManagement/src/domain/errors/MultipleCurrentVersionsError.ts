import { DomainError } from '@hatsuportal/shared-kernel'

export class MultipleCurrentVersionsError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Multiple current versions detected')
  }
}
