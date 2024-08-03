import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidTagCreatorIdError } from '../errors/InvalidTagCreatorIdError'

export class TagCreatorId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      TagCreatorId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new TagCreatorId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidTagCreatorIdError(error)
    }
  }
}
