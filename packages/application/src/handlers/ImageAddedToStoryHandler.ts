import { DomainEventHandler, IImageRepository } from '@hatsuportal/domain'
import { ImageAddedToStoryEvent } from '@hatsuportal/domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('ImageAddedToStoryHandler')

export class ImageAddedToStoryHandler implements DomainEventHandler<ImageAddedToStoryEvent> {
  constructor(private readonly imageRepository: IImageRepository) {}

  async handle(event: ImageAddedToStoryEvent): Promise<void> {
    try {
      // Repository handles both DB and filesystem operations atomically
      await this.imageRepository.insert(event.image)
    } catch (error) {
      logger.error('Error adding image to story', error)
      throw new DomainEventHandlerError(`Failed to add Image to Story '${event.story.id.value}'.`)
    }
  }
}
