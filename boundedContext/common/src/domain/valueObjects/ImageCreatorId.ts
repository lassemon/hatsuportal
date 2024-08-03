import { InvalidImageCreatorIdError } from '../errors/InvalidImageCreatorIdError'
import { UniqueId } from './UniqueId'

export class ImageCreatorId extends UniqueId {
  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageCreatorIdError(error)
    }
  }

  static override canCreate(value: string) {
    try {
      new ImageCreatorId(value)
      return true
    } catch {
      return false
    }
  }
}
