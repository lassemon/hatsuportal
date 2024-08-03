import { Logger } from '@hatsuportal/common'
import { InvalidImageIdError } from '../errors/InvalidImageIdError'
import { UniqueId } from './UniqueId'

const logger = new Logger('ImageId')
export class ImageId extends UniqueId {
  static override canCreate(value: string) {
    try {
      new ImageId(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidImageIdError(error)
    }
  }
}
