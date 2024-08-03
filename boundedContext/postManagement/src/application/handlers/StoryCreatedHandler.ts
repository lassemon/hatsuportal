import { DomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { StoryCreatedEvent } from '../../domain'

export class StoryCreatedHandler implements DomainEventHandler<StoryCreatedEvent> {
  constructor() {}

  async handle(event: StoryCreatedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to create Story '${event.story.id.value}'.`)
    }
  }
}
