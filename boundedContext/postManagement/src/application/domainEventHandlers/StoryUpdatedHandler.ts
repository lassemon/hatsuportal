import {
  StoryTitleUpdatedEvent,
  StoryVisibilityUpdatedEvent,
  StoryBodyUpdatedEvent,
  StoryTagsUpdatedEvent,
  StoryTagAddedEvent,
  StoryTagRemovedEvent
} from '../../domain'
import { IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class StoryUpdatedHandler implements IDomainEventHandler {
  constructor() {}

  async handle(
    event:
      | StoryTitleUpdatedEvent
      | StoryVisibilityUpdatedEvent
      | StoryBodyUpdatedEvent
      | StoryTagsUpdatedEvent
      | StoryTagAddedEvent
      | StoryTagRemovedEvent
  ): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Story '${event.data.id}'.`)
    }
  }
}
