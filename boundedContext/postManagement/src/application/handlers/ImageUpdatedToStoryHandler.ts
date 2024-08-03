import { IDomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { ImageUpdatedToStoryEvent } from '../../domain'

export class ImageUpdatedToStoryHandler implements IDomainEventHandler<ImageUpdatedToStoryEvent> {
  constructor() {}

  async handle(event: ImageUpdatedToStoryEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to update Image to Story '${event.story.id.value}'.`)
    }
  }
}
