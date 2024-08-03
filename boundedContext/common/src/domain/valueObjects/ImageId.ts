import { InvalidImageIdError } from '../errors/InvalidImageIdError'
import { UniqueId } from './UniqueId'

export class ImageId extends UniqueId {
  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageIdError(error)
    }
  }

  static override canCreate(value: string) {
    try {
      new ImageId(value)
      return true
    } catch {
      return false
    }
  }
}
