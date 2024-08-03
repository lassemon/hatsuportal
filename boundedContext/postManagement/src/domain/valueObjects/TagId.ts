import { UniqueId } from '@hatsuportal/shared-kernel'
import { InvalidTagIdError } from '../errors/InvalidTagIdError'

export class TagId extends UniqueId {
  static override canCreate(value: string): boolean {
    try {
      TagId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new TagId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidTagIdError(error)
    }
  }
}
