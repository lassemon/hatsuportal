import DomainError from './DomainError'

export class InvalidRoleListError extends DomainError {
  constructor(message?: string) {
    super(message)
  }
}
