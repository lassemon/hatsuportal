import { Logger } from '@hatsuportal/platform'
import { IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { CoverImageAddedToStoryEvent } from '../../domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

const logger = new Logger('ImageAddedToStoryHandler')

export class CoverImageAddedToStoryHandler implements IDomainEventHandler {
  constructor() {}

  async handle(event: CoverImageAddedToStoryEvent): Promise<void> {
    try {
    } catch (error) {
      logger.error('Error adding image to story', error)
      throw new DomainEventHandlerError(`Failed to add Image to Story '${event.data.id}'.`)
    }
  }
}
