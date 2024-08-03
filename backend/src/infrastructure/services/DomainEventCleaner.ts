import { IDomainEventRepository, IAdvisoryLock } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('DomainEventCleaner')

export class DomainEventCleaner {
  constructor(
    private readonly domainEventRepository: IDomainEventRepository,
    private readonly maxAgeSeconds: number,
    private readonly cleanupLock: IAdvisoryLock
  ) {}

  async cleanOldDomainEvents(): Promise<void> {
    /**
     * Try to acquire the processing lock. If another instance holds the lock, skip the processing.
     * This is to prevent multiple simultaneously running instances of this app from cleaning domain events concurrently.
     */
    const acquired = await this.cleanupLock.tryAcquire()
    if (!acquired) {
      logger.debug('Skipping domain event cleanup — another instance holds the lock')
      return
    }

    try {
      const nowSeconds = Math.floor(Date.now() / 1000)
      const cutoff = new UnixTimestamp(nowSeconds - this.maxAgeSeconds)
      const deletedCount = await this.domainEventRepository.deleteOlderThan(cutoff)

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} domain event(s) older than 7 days`)
      } else {
        logger.debug('No old domain events to clean up')
      }
    } finally {
      await this.cleanupLock.release()
    }
  }
}
