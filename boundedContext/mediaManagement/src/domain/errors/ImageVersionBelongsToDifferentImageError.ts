import { DomainError } from '@hatsuportal/shared-kernel'

export class ImageVersionBelongsToDifferentImageError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Image version belongs to a different image')
  }
}
