import { DomainEventHandler, IStoryRepository, StoryUpdatedEvent } from '@hatsuportal/domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class StoryUpdatedHandler implements DomainEventHandler<StoryUpdatedEvent> {
  constructor(private readonly storyRepository: IStoryRepository) {}

  async handle(event: StoryUpdatedEvent): Promise<void> {
    try {
      await this.storyRepository.update(event.story)
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Story '${event.story.id.value}'.`)
    }
  }
}
