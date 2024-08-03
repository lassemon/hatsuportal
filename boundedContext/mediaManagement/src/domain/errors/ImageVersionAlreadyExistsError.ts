import { DomainError } from '@hatsuportal/shared-kernel'

export class ImageVersionAlreadyExistsError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Image version already exists')
  }
}
