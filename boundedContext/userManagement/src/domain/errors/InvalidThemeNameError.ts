import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidThemeNameError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Invalid theme name')
  }
}
