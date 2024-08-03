import { IImageRepository, IImageStorageService } from '@hatsuportal/media-management'
import { Logger } from '@hatsuportal/common'
import { IAdvisoryLock } from '@hatsuportal/platform'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

const logger = new Logger('OrphanImageCleaner')

/**
 * Removes **orphan storage blobs**: files that exist in object storage but have no
 * corresponding row in the Media database (`image_versions.storage_key`).
 *
 * Typical causes:
 * - a staged upload succeeded outside a transaction, then the Unit of Work rolled back;
 * - a promotion or copy was finalized in storage but the metadata commit never completed;
 * - any other path that leaves a blob on disk/S3 without a registered storage key.
 *
 * This cleaner only deletes the **storage object** directly. It does not touch Media
 * metadata because none exists for these keys.
 *
 * Contrast with {@link UnreferencedImageCleaner}, which handles the opposite problem:
 * images that **do** have Media DB records but are no longer linked from any story cover.
 *
 * Both cleaners run from {@link CleanupOrphanImagesJob} and share the same minimum age
 * grace period so in-flight uploads and event handlers can finish first.
 */
export class OrphanImageCleaner {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageStorageService: IImageStorageService,
    private readonly orphanMinAgeMs: number,
    private readonly cleanupLock: IAdvisoryLock
  ) {}

  /** Deletes storage keys that are absent from the image repository. */
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
      // Set forces unique values
      const knownKeys = new Set(await this.imageRepository.findAllStorageKeys())
      const storageEntries = await this.imageStorageService.listAllStorageKeys()

      const now = Date.now()
      let deletedCount = 0

      for (const entry of storageEntries) {
        if (knownKeys.has(entry.key)) continue // skip images that are in both storage and repository, aka not orphan

        const ageMs = now - entry.lastModified.getTime()
        if (ageMs < this.orphanMinAgeMs) continue // skip images that are too young

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
