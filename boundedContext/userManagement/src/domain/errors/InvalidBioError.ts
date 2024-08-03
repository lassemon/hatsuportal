import { DomainError } from '@hatsuportal/shared-kernel'

export class InvalidBioError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Bio is not valid')
  }
}
