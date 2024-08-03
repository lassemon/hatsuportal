import { Maybe } from '@hatsuportal/common'
import { InvalidImageCreatorIdError } from '../errors/InvalidImageCreatorIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ImageCreatorId extends UniqueId {
  public static override readonly UNKNOWN = new ImageCreatorId(UniqueId.UNKNOWN.value)

  static override canCreate(value: string): boolean {
    try {
      ImageCreatorId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new ImageCreatorId(value)
  }

  static fromOptional(value: Maybe<ImageCreatorId> | string): ImageCreatorId {
    if (!value || ImageCreatorId.UNKNOWN.equals(value)) {
      return ImageCreatorId.UNKNOWN
    }
    return value instanceof ImageCreatorId ? value : new ImageCreatorId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageCreatorIdError(error)
    }
  }
}
