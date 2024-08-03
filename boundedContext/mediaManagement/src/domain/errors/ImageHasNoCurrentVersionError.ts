import { DomainError } from '@hatsuportal/shared-kernel'

export class ImageHasNoCurrentVersionError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Image has no current version')
  }
}
