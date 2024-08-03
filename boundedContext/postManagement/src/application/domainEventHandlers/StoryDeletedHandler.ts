import { IDomainEvent, IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { StoryDeletedEvent } from '../../domain'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class StoryDeletedHandler implements IDomainEventHandler<IDomainEvent<UnixTimestamp>, UnixTimestamp> {
  constructor() {}

  async handle(event: StoryDeletedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.story.id.value}'.`)
    }
  }
}
