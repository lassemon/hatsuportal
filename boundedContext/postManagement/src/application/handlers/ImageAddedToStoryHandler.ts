import { Logger } from '@hatsuportal/common'
import { DomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { ImageAddedToStoryEvent } from '../../domain'

const logger = new Logger('ImageAddedToStoryHandler')

export class ImageAddedToStoryHandler implements DomainEventHandler<ImageAddedToStoryEvent> {
  constructor() {}

  async handle(event: ImageAddedToStoryEvent): Promise<void> {
    try {
    } catch (error) {
      logger.error('Error adding image to story', error)
      throw new DomainEventHandlerError(`Failed to add Image to Story '${event.story.id.value}'.`)
    }
  }
}
