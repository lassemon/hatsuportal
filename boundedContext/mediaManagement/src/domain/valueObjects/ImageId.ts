import { Maybe } from '@hatsuportal/common'
import { InvalidImageIdError } from '../errors/InvalidImageIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ImageId extends UniqueId {
  public static override readonly UNKNOWN = new ImageId(UniqueId.UNKNOWN.value)

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

  static fromOptional(value: Maybe<ImageId> | string): ImageId {
    if (!value || ImageId.UNKNOWN.equals(value)) {
      return ImageId.UNKNOWN
    }
    return value instanceof ImageId ? value : new ImageId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageIdError(error)
    }
  }
}
