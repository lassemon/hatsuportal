import { ApplicationError } from '@hatsuportal/platform'

export class IncompleteImageError extends ApplicationError {
  constructor(imageId: string) {
    super(`Incomplete image. Image metadata record '${imageId}' has no current version id`)
  }
}
