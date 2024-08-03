import { DomainEventHandler, IStoryRepository, PostId, StoryCreatedEvent } from '@hatsuportal/domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'
import { ForbiddenError } from '../errors/ForbiddenError'

export class StoryCreatedHandler implements DomainEventHandler<StoryCreatedEvent> {
  constructor(private readonly storyRepository: IStoryRepository) {}

  async handle(event: StoryCreatedEvent): Promise<void> {
    try {
      await this.ensureUniqueId(event.story.id)
      await this.storyRepository.insert(event.story)
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to create Story '${event.story.id.value}'.`)
    }
  }

  private async ensureUniqueId(id: PostId): Promise<void> {
    const previousStory = await this.storyRepository.findById(id)
    if (previousStory) {
      throw new ForbiddenError(`Cannot create story with id ${id} because it already exists.`)
    }
  }
}
