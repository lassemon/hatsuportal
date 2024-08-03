import { DomainEventHandler, IImageRepository } from '@hatsuportal/domain'
import { ImageRemovedFromStoryEvent } from '@hatsuportal/domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class ImageRemovedFromStoryHandler implements DomainEventHandler<ImageRemovedFromStoryEvent> {
  constructor(private readonly imageRepository: IImageRepository) {}

  async handle(event: ImageRemovedFromStoryEvent): Promise<void> {
    try {
      // Repository handles both DB and filesystem operations atomically
      await this.imageRepository.delete(event.removedImage)
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to remove Image from Story '${event.story.id.value}'.`)
    }
  }
}
