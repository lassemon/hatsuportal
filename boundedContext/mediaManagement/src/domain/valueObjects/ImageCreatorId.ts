import { InvalidImageCreatorIdError } from '../errors/InvalidImageCreatorIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ImageCreatorId extends UniqueId {
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

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageCreatorIdError(error)
    }
  }
}
