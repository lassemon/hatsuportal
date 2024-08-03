import { IDomainEventDispatcher, IDomainEventHandlerRegistry, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  CoverImageAddedToStoryHandler,
  CoverImageRemovedFromStoryHandler,
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
    // Create handlers with dependencies from the container
    const storyCreatedHandler = new StoryCreatedHandler()
    const storyDeletedHandler = new StoryDeletedHandler()
    const storyUpdatedHandler = new StoryUpdatedHandler()
    const coverImageAddedHandler = new CoverImageAddedToStoryHandler()
    const coverImageUpdatedHandler = new CoverImageUpdatedToStoryHandler()
    const coverImageRemovedHandler = new CoverImageRemovedFromStoryHandler()

    this.eventDispatcher.register(StoryEventTypes.StoryCreated, storyCreatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryDeleted, storyDeletedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryNameUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryVisibilityUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryDescriptionUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryTagsUpdated, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryTagAdded, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.StoryTagRemoved, storyUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.CoverImageAddedToStory, coverImageAddedHandler)
    this.eventDispatcher.register(StoryEventTypes.CoverImageUpdatedToStory, coverImageUpdatedHandler)
    this.eventDispatcher.register(StoryEventTypes.CoverImageRemovedFromStory, coverImageRemovedHandler)

    // TODO, add handlers for other events
  }
}
