import { DomainEventHandler, IStoryRepository, StoryDeletedEvent } from '@hatsuportal/domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class StoryDeletedHandler implements DomainEventHandler<StoryDeletedEvent> {
  constructor(private readonly storyRepository: IStoryRepository) {}

  async handle(event: StoryDeletedEvent): Promise<void> {
    try {
      await this.storyRepository.delete(event.story.id)
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.story.id.value}'.`)
    }
  }
}
