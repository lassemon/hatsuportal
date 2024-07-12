import DomainError from './DomainError'

class UnsupportedUserRoleError extends DomainError {
  constructor(public readonly code: string) {
    super()
  }
}

export default UnsupportedUserRoleError
