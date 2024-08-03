import { UniqueId } from '@hatsuportal/common-bounded-context'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'

export class UserId extends UniqueId {
  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidUserIdError(error)
    }
  }

  static override canCreate(value: string) {
    try {
      new UserId(value)
      return true
    } catch {
      return false
    }
  }
}
