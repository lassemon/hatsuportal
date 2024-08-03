import { IImageRepository, IImageStorageService } from '@hatsuportal/media-management'
import { Logger } from '@hatsuportal/common'
import { IAdvisoryLock } from '@hatsuportal/platform'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

const logger = new Logger('OrphanImageCleaner')

export class OrphanImageCleaner {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageStorageService: IImageStorageService,
    private readonly orphanMinAgeMs: number,
    private readonly cleanupLock: IAdvisoryLock
  ) {}

  async cleanOrphanImages(): Promise<void> {
    /**
     * Try to acquire the processing lock. If another instance holds the lock, skip the processing.
     * This is to prevent multiple simultaneously running instances of this app from cleaning orphan images concurrently.
     */
    const acquired = await this.cleanupLock.tryAcquire()
    if (!acquired) {
      logger.debug('Skipping orphan image cleanup — another instance holds the lock')
      return
    }

    try {
      const knownKeys = new Set(await this.imageRepository.findAllStorageKeys())
      const storageEntries = await this.imageStorageService.listAllStorageKeys()

      const now = Date.now()
      let deletedCount = 0

      for (const entry of storageEntries) {
        if (knownKeys.has(entry.key)) continue

        const ageMs = now - entry.lastModified.getTime()
        if (ageMs < this.orphanMinAgeMs) continue // skip files that are too young

        logger.debug(`Deleting orphan image file: ${entry.key}`)

        try {
          await this.imageStorageService.deleteImage(new NonEmptyString(entry.key))
          deletedCount++
          logger.debug(`Deleted orphan image file: ${entry.key}`)
        } catch (error) {
          logger.warn(`Failed to delete orphan image file: ${entry.key}`, error)
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} orphan image file(s)`)
      } else {
        logger.debug('No orphan image files found')
      }
    } finally {
      await this.cleanupLock.release()
    }
  }
}
