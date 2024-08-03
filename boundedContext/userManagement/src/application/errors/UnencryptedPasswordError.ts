import { ApplicationError } from '@hatsuportal/platform'

export class UnencryptedPasswordError extends ApplicationError {
  constructor(message?: string) {
    super(message || 'Attempted to add unencrypted password to database')
  }
}
