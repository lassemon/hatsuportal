import { IDomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { StoryCreatedEvent } from '../../domain'

export class StoryCreatedHandler implements IDomainEventHandler<StoryCreatedEvent> {
  constructor() {}

  async handle(event: StoryCreatedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to create Story '${event.story.id.value}'.`)
    }
  }
}
