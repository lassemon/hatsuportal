import { IDomainEvent, IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { CoverImageRemovedFromStoryEvent } from '../../domain'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class CoverImageRemovedFromStoryHandler implements IDomainEventHandler<IDomainEvent<UnixTimestamp>, UnixTimestamp> {
  constructor() {}

  async handle(event: CoverImageRemovedFromStoryEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to remove Image from Story '${event.story.id.value}'.`)
    }
  }
}
