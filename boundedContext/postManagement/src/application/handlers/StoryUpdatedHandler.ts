import { IDomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { StoryUpdatedEvent } from '../../domain'

export class StoryUpdatedHandler implements IDomainEventHandler<StoryUpdatedEvent> {
  constructor() {}

  async handle(event: StoryUpdatedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Story '${event.story.id.value}'.`)
    }
  }
}
