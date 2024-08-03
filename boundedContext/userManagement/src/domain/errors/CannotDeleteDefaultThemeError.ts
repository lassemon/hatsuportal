import { DomainError } from '@hatsuportal/shared-kernel'

export class CannotDeleteDefaultThemeError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'The default theme cannot be deleted')
  }
}
