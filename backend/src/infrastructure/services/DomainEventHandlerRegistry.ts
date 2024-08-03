import { IDomainEventDispatcher, IDomainEventHandlerRegistry, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  CoverImageAddedToStoryHandler,
  CoverImageRemovedFromStoryHandler,
  CoverImageUpdatedToStoryHandler,
  StoryCreatedHandler,
  StoryDeletedHandler,
  StoryUpdatedHandler
} from '@hatsuportal/post-management'
import { inject, singleton } from 'tsyringe'

@singleton()
export class DomainEventHandlerRegistry implements IDomainEventHandlerRegistry {
  constructor(@inject('IDomainEventDispatcher') private readonly eventDispatcher: IDomainEventDispatcher<UnixTimestamp>) {
    this.registerHandlers()
  }

  registerHandlers(): void {
    // Create handlers with dependencies from the container
    const storyCreatedHandler = new StoryCreatedHandler()
    const storyUpdatedHandler = new StoryUpdatedHandler()
    const storyDeletedHandler = new StoryDeletedHandler()
    const coverImageAddedHandler = new CoverImageAddedToStoryHandler()
    const coverImageUpdatedHandler = new CoverImageUpdatedToStoryHandler()
    const coverImageRemovedHandler = new CoverImageRemovedFromStoryHandler()

    // Register handlers
    this.eventDispatcher.register('StoryCreated', storyCreatedHandler)
    this.eventDispatcher.register('StoryUpdated', storyUpdatedHandler)
    this.eventDispatcher.register('StoryDeleted', storyDeletedHandler)
    this.eventDispatcher.register('CoverImageAddedToStory', coverImageAddedHandler)
    this.eventDispatcher.register('CoverImageUpdatedToStory', coverImageUpdatedHandler)
    this.eventDispatcher.register('CoverImageRemovedFromStory', coverImageRemovedHandler)
  }
}
