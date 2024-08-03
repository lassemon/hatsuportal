import { unixtimeNow } from '@hatsuportal/common'
import { IDomainEventInfrastructureMapper, IDomainEventRepository, IAdvisoryLock } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

import { IDomainEventDispatcher } from '@hatsuportal/shared-kernel'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('DomainEventProcessor')

export class DomainEventProcessor {
  constructor(
    private readonly domainEventRepository: IDomainEventRepository,
    private readonly domainEventInfrastructureMapper: IDomainEventInfrastructureMapper,
    private readonly eventDispatcher: IDomainEventDispatcher<UnixTimestamp>,
    private readonly processingLock: IAdvisoryLock
  ) {}

  async processDomainEvents(): Promise<void> {
    /**
     * Try to acquire the processing lock. If another instance holds the lock, skip the processing.
     * This is to prevent multiple simultaneously running instances of this app from processing the same domain events concurrently.
     */
    const acquired = await this.processingLock.tryAcquire()
    if (!acquired) {
      logger.debug('Skipping outbox processing — another instance holds the lock')
      return
    }

    try {
      const unpublished = await this.domainEventRepository.findUnpublished(100)
      if (unpublished.length > 0) {
        logger.debug(`Found ${unpublished.length} unpublished domain events. Publishing now...`)
      }

      for (const event of unpublished) {
        try {
          await this.eventDispatcher.dispatch(this.domainEventInfrastructureMapper.toDomainEvent(event))
          await this.domainEventRepository.markAsPublished(event.id, new UnixTimestamp(unixtimeNow()))
        } catch (error) {
          logger.error(`Failed to publish outbox entry ${event.id}`, error)
        }
      }
    } finally {
      await this.processingLock.release()
    }
  }
}
