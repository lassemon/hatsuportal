import { Maybe } from '@hatsuportal/common'
import { InvalidImageVersionIdError } from '../errors/InvalidImageVersionIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ImageVersionId extends UniqueId {
  public static readonly NOT_SET = new ImageVersionId(UniqueId.UNKNOWN.value)

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

  static fromOptional(value: Maybe<ImageVersionId> | string): ImageVersionId {
    if (!value || ImageVersionId.NOT_SET.equals(value)) {
      return ImageVersionId.NOT_SET
    }
    return value instanceof ImageVersionId ? value : new ImageVersionId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageVersionIdError(error)
    }
  }
}
