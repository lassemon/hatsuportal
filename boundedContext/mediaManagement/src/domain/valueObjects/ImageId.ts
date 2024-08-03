import { InvalidImageIdError } from '../errors/InvalidImageIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ImageId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      ImageId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new ImageId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageIdError(error)
    }
  }
}
