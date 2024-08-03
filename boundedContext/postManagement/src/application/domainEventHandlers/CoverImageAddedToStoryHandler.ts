import { Logger } from '@hatsuportal/common'
import { IDomainEvent, IDomainEventHandler } from '@hatsuportal/shared-kernel'
import { CoverImageAddedToStoryEvent } from '../../domain'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventHandlerError } from '../errors/DomainEventHandlerError'

const logger = new Logger('ImageAddedToStoryHandler')

export class CoverImageAddedToStoryHandler implements IDomainEventHandler<IDomainEvent<UnixTimestamp>, UnixTimestamp> {
  constructor() {}

  async handle(event: CoverImageAddedToStoryEvent): Promise<void> {
    try {
    } catch (error) {
      logger.error('Error adding image to story', error)
      throw new DomainEventHandlerError(`Failed to add Image to Story '${event.story.id.value}'.`)
    }
  }
}
