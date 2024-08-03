import { IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { StoryDeletedEvent } from '../../domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class StoryDeletedHandler implements IDomainEventHandler {
  constructor() {}

  async handle(event: StoryDeletedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.data.id}'.`)
    }
  }
}
