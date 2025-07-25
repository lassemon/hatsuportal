import { Logger } from '@hatsuportal/common'
import { InvalidImageCreatorIdError } from '../errors/InvalidImageCreatorIdError'
import { UniqueId } from './UniqueId'

const logger = new Logger('ImageCreatorId')

interface CanCreateOptions {
  throwError?: boolean
}

export class ImageCreatorId extends UniqueId {
  static override canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new ImageCreatorId(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
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
