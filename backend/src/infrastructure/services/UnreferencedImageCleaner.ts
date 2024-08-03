import { DeleteImageUseCase, IImageRepository } from '@hatsuportal/media-management'
import { IStoryReadRepository } from '@hatsuportal/post-management'
import { SystemUserId } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'
import { IAdvisoryLock, NotFoundError } from '@hatsuportal/platform'

const logger = new Logger('UnreferencedImageCleaner')

/**
 * Removes **unreferenced images**: Media entities that still exist in the database
 * (image + version rows and their storage keys) but are not linked as a cover image
 * on any story (`post_image_links`).
 *
 * Typical causes:
 * - a cover was replaced before the old image was deleted (e.g. chained staged
 *   replacements A → B → C, where A is superseded and never referenced again);
 * - synchronous cover removal or story deletion where post-commit delete did not succeed;
 *
 * Deletion goes through {@link DeleteImageUseCase}, so both metadata and all
 * associated storage objects are removed together.
 *
 * Contrast with {@link OrphanImageCleaner}, which handles storage blobs that were
 * never registered in the database at all. An unreferenced image is **not** an orphan
 * from the storage cleaner's perspective — its keys appear in
 * `findAllStorageKeys()` — so it would never be picked up there.
 *
 * Both cleaners run from {@link CleanupOrphanImagesJob} and share the same minimum
 * age grace period so in-flight promotions and event handlers can finish first.
 */
export class UnreferencedImageCleaner {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly storyReadRepository: IStoryReadRepository,
    private readonly deleteImageUseCase: DeleteImageUseCase,
    private readonly systemUserId: SystemUserId,
    private readonly minAgeMs: number,
    private readonly cleanupLock: IAdvisoryLock
  ) {}

  /** Deletes Media images that no story cover link references. */
  async cleanUnreferencedImages(): Promise<void> {
    const acquired = await this.cleanupLock.tryAcquire()
    if (!acquired) {
      logger.debug('Skipping unreferenced image cleanup — another instance holds the lock')
      return
    }

    try {
      const referencedImageIds = new Set(await this.storyReadRepository.findAllReferencedCoverImageIds())
      const candidates = await this.imageRepository.findAllCleanupCandidates()
      const now = Date.now()
      let deletedCount = 0

      for (const candidate of candidates) {
        if (referencedImageIds.has(candidate.id)) {
          continue // skip images that are referenced by a story cover image
        }

        const ageMs = now - candidate.updatedAt
        if (ageMs < this.minAgeMs) {
          continue
        }

        try {
          await this.deleteImageUseCase.execute({
            deletedById: this.systemUserId.value,
            deleteImageInput: { imageId: candidate.id },
            imageDeleted: () => undefined
          })
          deletedCount++
          logger.debug(`Deleted unreferenced image ${candidate.id}`)
        } catch (error) {
          if (error instanceof NotFoundError) {
            logger.debug(`Skipped already-deleted unreferenced image ${candidate.id}`)
            continue
          }

          logger.warn(`Failed to delete unreferenced image ${candidate.id}`, error)
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} unreferenced image(s)`)
      } else {
        logger.debug('No unreferenced images found')
      }
    } finally {
      await this.cleanupLock.release()
    }
  }
}
