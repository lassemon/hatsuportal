import { IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { CoverImageUpdatedToStoryEvent } from '../../domain'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

export class CoverImageUpdatedToStoryHandler implements IDomainEventHandler {
  constructor() {}

  async handle(event: CoverImageUpdatedToStoryEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.data.id}'.`)
    }
  }
}
