import { InvalidImageVersionIdError } from '../errors/InvalidImageVersionIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ImageVersionId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      ImageVersionId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new ImageVersionId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageVersionIdError(error)
    }
  }
}
