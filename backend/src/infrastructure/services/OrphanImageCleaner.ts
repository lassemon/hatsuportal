import { promises as fs } from 'node:fs'
import path from 'path'
import { IImageRepository } from '@hatsuportal/media-management'
import { Logger } from '@hatsuportal/common'
import { IAdvisoryLock } from '@hatsuportal/platform'

const logger = new Logger('OrphanImageCleaner')

export class OrphanImageCleaner {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imagesBasePath: string,
    private readonly maxOrphanAgeMs: number,
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
      const filesOnDisk = await this.listImageFiles()

      const now = Date.now()
      let deletedCount = 0

      for (const file of filesOnDisk) {
        if (knownKeys.has(file.name)) continue

        const ageMs = now - file.mtimeMs
        if (ageMs < this.maxOrphanAgeMs) continue

        logger.debug(`Deleting orphan image file: ${file.name}`)

        try {
          await fs.unlink(path.join(this.imagesBasePath, file.name))
          deletedCount++
          logger.debug(`Deleted orphan image file: ${file.name}`)
        } catch (error) {
          logger.warn(`Failed to delete orphan image file: ${file.name}`, error)
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

  private async listImageFiles(): Promise<Array<{ name: string; mtimeMs: number }>> {
    try {
      const entries = await fs.readdir(this.imagesBasePath)
      const results: Array<{ name: string; mtimeMs: number }> = []

      for (const entry of entries) {
        try {
          const stat = await fs.stat(path.join(this.imagesBasePath, entry))
          if (stat.isFile()) {
            results.push({ name: entry, mtimeMs: stat.mtimeMs })
          }
        } catch {
          // file may have been deleted between readdir and stat
        }
      }

      return results
    } catch (error) {
      logger.error('Failed to list image directory', error)
      return []
    }
  }
}
