import { ApplicationError } from '@hatsuportal/platform'

export class ImageProcessingError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Image processing error')
  }
}
