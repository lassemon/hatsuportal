import { Logger } from '@hatsuportal/common'
import { InvalidImageCreatorIdError } from '../errors/InvalidImageCreatorIdError'
import { UniqueId } from './UniqueId'

const logger = new Logger('ImageCreatorId')
export class ImageCreatorId extends UniqueId {
  static override canCreate(value: string) {
    try {
      new ImageCreatorId(value)
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
      throw new InvalidImageCreatorIdError(error)
    }
  }
}
