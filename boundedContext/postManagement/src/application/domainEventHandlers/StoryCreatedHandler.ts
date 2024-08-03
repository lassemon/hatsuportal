import { StoryCreatedEvent } from '../../domain'
import { IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class StoryCreatedHandler implements IDomainEventHandler {
  constructor() {}

  async handle(event: StoryCreatedEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to create Story '${event.data.id}'.`)
    }
  }
}
