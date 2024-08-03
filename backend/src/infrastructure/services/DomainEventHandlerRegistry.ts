import {
  IDomainEventDispatcher,
  IDomainEventHandlerRegistry,
  ImageAddedToStoryHandler,
  ImageRemovedFromStoryHandler,
  ImageUpdatedToStoryHandler,
  StoryCreatedHandler,
  StoryDeletedHandler,
  StoryUpdatedHandler
} from '@hatsuportal/application'
import { IImageRepository, IStoryRepository } from '@hatsuportal/domain'
import { inject, singleton } from 'tsyringe'

@singleton()
export class DomainEventHandlerRegistry implements IDomainEventHandlerRegistry {
  constructor(
    @inject('IDomainEventDispatcher') private readonly eventDispatcher: IDomainEventDispatcher,
    @inject('IStoryRepository') private readonly storyRepository: IStoryRepository,
    @inject('IImageRepository') private readonly imageRepository: IImageRepository
  ) {
    this.registerHandlers()
  }

  registerHandlers(): void {
    // Create handlers with dependencies from the container
    const storyCreatedHandler = new StoryCreatedHandler(this.storyRepository)
    const storyUpdatedHandler = new StoryUpdatedHandler(this.storyRepository)
    const storyDeletedHandler = new StoryDeletedHandler(this.storyRepository)
    const imageAddedHandler = new ImageAddedToStoryHandler(this.imageRepository)
    const imageUpdatedHandler = new ImageUpdatedToStoryHandler(this.imageRepository)
    const imageRemovedHandler = new ImageRemovedFromStoryHandler(this.imageRepository)

    // Register handlers
    this.eventDispatcher.register('StoryCreated', storyCreatedHandler)
    this.eventDispatcher.register('StoryUpdated', storyUpdatedHandler)
    this.eventDispatcher.register('StoryDeleted', storyDeletedHandler)
    this.eventDispatcher.register('ImageAddedToStory', imageAddedHandler)
    this.eventDispatcher.register('ImageUpdatedToStory', imageUpdatedHandler)
    this.eventDispatcher.register('ImageRemovedFromStory', imageRemovedHandler)
  }
}
