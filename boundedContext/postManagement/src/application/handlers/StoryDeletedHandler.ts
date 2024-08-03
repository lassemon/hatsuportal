import { IDomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { StoryDeletedEvent } from '../../domain'

export class StoryDeletedHandler implements IDomainEventHandler<StoryDeletedEvent> {
  constructor() {}

  async handle(event: StoryDeletedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.story.id.value}'.`)
    }
  }
}
