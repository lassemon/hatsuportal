import { Logger } from '@hatsuportal/common'
import { IDomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { ImageAddedToStoryEvent } from '../../domain'

const logger = new Logger('ImageAddedToStoryHandler')

export class ImageAddedToStoryHandler implements IDomainEventHandler<ImageAddedToStoryEvent> {
  constructor() {}

  async handle(event: ImageAddedToStoryEvent): Promise<void> {
    try {
    } catch (error) {
      logger.error('Error adding image to story', error)
      throw new DomainEventHandlerError(`Failed to add Image to Story '${event.story.id.value}'.`)
    }
  }
}
