import { InvalidCoverImageIdError } from '../errors/InvalidCoverImageIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class CoverImageId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      CoverImageId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new CoverImageId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidCoverImageIdError(error)
    }
  }
}
