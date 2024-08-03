import { ApplicationError } from '@hatsuportal/platform'

export class JwtSecretMissingError extends ApplicationError {
  constructor(message?: string) {
    super(message || 'JWT_SECRET environment variable is not set')
  }
}
