import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidThemeIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid theme id')
  }
}
