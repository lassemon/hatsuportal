import { IDomainEventDispatcher, IDomainEventHandlerRegistry, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  CoverImageAddedToStoryHandler,
  CoverImageUpdatedToStoryHandler,
  StoryCreatedHandler,
  StoryUpdatedHandler,
  StoryDeletedHandler,
  StoryEventTypes
} from '@hatsuportal/post-management'

export class DomainEventHandlerRegistry implements IDomainEventHandlerRegistry {
  constructor(private readonly eventDispatcher: IDomainEventDispatcher<UnixTimestamp>) {
    this.registerHandlers()
  }

  registerHandlers(): void {
    const storyCreatedHandler = new StoryCreatedHandler()
    const storyDeletedHandler = new StoryDeletedHandler()
    const storyUpdatedHandler = new StoryUpdatedHandler()
    const coverImageAddedHandler = new CoverImageAddedToStoryHandler()
    const coverImageUpdatedHandler = new CoverImageUpdatedToStoryHandler()

    this.eventDispatcher.register(StoryEventTypes.StoryCreated, storyCreatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryDeleted, storyDeletedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryTitleUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryVisibilityUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryBodyUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryTagsUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryTagAdded, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryTagRemoved, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.CoverImageAddedToStory, coverImageAddedHandler)
    this.eventDispatcher.register(StoryEventTypes.CoverImageUpdatedToStory, coverImageUpdatedHandler)
  }
}
