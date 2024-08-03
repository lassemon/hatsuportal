import DomainError from './DomainError'

export class InvalidUserRoleError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
