import { StoryCreatedEvent } from '../../domain'
import { IDomainEvent, IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class StoryCreatedHandler implements IDomainEventHandler<IDomainEvent<UnixTimestamp>, UnixTimestamp> {
  constructor() {}

  async handle(event: StoryCreatedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to create Story '${event.story.id.value}'.`)
    }
  }
}
