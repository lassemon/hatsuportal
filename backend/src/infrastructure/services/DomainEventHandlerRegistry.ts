import { IDomainEventDispatcher, IDomainEventHandlerRegistry } from '@hatsuportal/common-bounded-context'
import {
  ImageAddedToStoryHandler,
  ImageRemovedFromStoryHandler,
  ImageUpdatedToStoryHandler,
  StoryCreatedHandler,
  StoryDeletedHandler,
  StoryUpdatedHandler
} from '@hatsuportal/post-management'
import { inject, singleton } from 'tsyringe'

@singleton()
export class DomainEventHandlerRegistry implements IDomainEventHandlerRegistry {
  constructor(@inject('IDomainEventDispatcher') private readonly eventDispatcher: IDomainEventDispatcher) {
    this.registerHandlers()
  }

  registerHandlers(): void {
    // Create handlers with dependencies from the container
    const storyCreatedHandler = new StoryCreatedHandler()
    const storyUpdatedHandler = new StoryUpdatedHandler()
    const storyDeletedHandler = new StoryDeletedHandler()
    const imageAddedHandler = new ImageAddedToStoryHandler()
    const imageUpdatedHandler = new ImageUpdatedToStoryHandler()
    const imageRemovedHandler = new ImageRemovedFromStoryHandler()

    // Register handlers
    this.eventDispatcher.register('StoryCreated', storyCreatedHandler)
    this.eventDispatcher.register('StoryUpdated', storyUpdatedHandler)
    this.eventDispatcher.register('StoryDeleted', storyDeletedHandler)
    this.eventDispatcher.register('ImageAddedToStory', imageAddedHandler)
    this.eventDispatcher.register('ImageUpdatedToStory', imageUpdatedHandler)
    this.eventDispatcher.register('ImageRemovedFromStory', imageRemovedHandler)
  }
}
