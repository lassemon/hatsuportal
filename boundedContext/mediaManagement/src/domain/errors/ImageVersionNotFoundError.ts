import { DomainError } from '@hatsuportal/shared-kernel'

export class ImageVersionNotFoundError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Image version not found')
  }
}
