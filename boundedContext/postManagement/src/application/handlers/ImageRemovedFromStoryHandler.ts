import { DomainEventHandler } from '@hatsuportal/common-bounded-context'
import { DomainEventHandlerError } from '@hatsuportal/common-bounded-context'
import { ImageRemovedFromStoryEvent } from '../../domain'

export class ImageRemovedFromStoryHandler implements DomainEventHandler<ImageRemovedFromStoryEvent> {
  constructor() {}

  async handle(event: ImageRemovedFromStoryEvent): Promise<void> {
    try {
    } catch (error) {
      throw new DomainEventHandlerError(`Failed to remove Image from Story '${event.story.id.value}'.`)
    }
  }
}
