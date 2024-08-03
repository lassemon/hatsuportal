import { IDomainEvent, IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { CoverImageUpdatedToStoryEvent } from '../../domain'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class CoverImageUpdatedToStoryHandler implements IDomainEventHandler<IDomainEvent<UnixTimestamp>, UnixTimestamp> {
  constructor() {}

  async handle(event: CoverImageUpdatedToStoryEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.story.id.value}'.`)
    }
  }
}
