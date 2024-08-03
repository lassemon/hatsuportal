import { DomainEventHandler, IImageRepository, ImageUpdatedToStoryEvent } from '@hatsuportal/domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class ImageUpdatedToStoryHandler implements DomainEventHandler<ImageUpdatedToStoryEvent> {
  constructor(private readonly imageRepository: IImageRepository) {}

  async handle(event: ImageUpdatedToStoryEvent): Promise<void> {
    try {
      // Repository handles both DB and filesystem operations atomically
      await this.imageRepository.update(event.newImage)
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.story.id.value}'.`)
    }
  }
}
