import { DomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { StoryDeletedEvent } from '../../domain'

export class StoryDeletedHandler implements DomainEventHandler<StoryDeletedEvent> {
  constructor() {}

  async handle(event: StoryDeletedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.story.id.value}'.`)
    }
  }
}
