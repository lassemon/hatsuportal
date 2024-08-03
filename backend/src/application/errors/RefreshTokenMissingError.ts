import { ApplicationError } from '@hatsuportal/platform'

export class RefreshTokenMissingError extends ApplicationError {
  constructor(message?: string) {
    super(message || 'REFRESH_TOKEN_SECRET environment variable is not set')
  }
}
