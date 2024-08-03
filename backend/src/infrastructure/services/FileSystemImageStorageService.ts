import path from 'path'
import { promises as fs } from 'node:fs'
import sanitize from 'sanitize-filename'
import { IImageStorageService, type MediaStorageKeyEntry } from '@hatsuportal/media-management'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { BASE64_PNG_PREFIX, DataPersistenceError } from '@hatsuportal/platform'
import { NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('ImageStorageService')

export class FileSystemImageStorageService implements IImageStorageService {
  private readonly imagesBasePath: string

  constructor(basePath: string) {
    this.imagesBasePath = toFilesystemImagesPath(basePath)
  }

  async storeImageBuffer(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void> {
    const sanitizedStorageKey = sanitize(storageKey.value)
    const outputPath = `${this.imagesBasePath}/${sanitizedStorageKey}`
    try {
      await fs.writeFile(outputPath, imageBuffer)
    } catch (error: unknown) {
      throw new DataPersistenceError({ message: `Error writing the file ${storageKey} to the filesystem`, cause: error })
    }
  }

  async getImage(storageKey: NonEmptyString): Promise<string> {
    try {
      const imagePath = path.resolve(this.imagesBasePath, storageKey.value)
      const imageBuffer = await fs.readFile(imagePath)
      let imageBase64 = imageBuffer.toString('base64')

      if (!imageBase64.startsWith(BASE64_PNG_PREFIX)) imageBase64 = `${BASE64_PNG_PREFIX},${imageBase64}`

      return imageBase64
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('no such file')) {
          logger.error(error.stack)
          throw new NotFoundError({ message: `Error reading the file ${storageKey} from the filesystem`, cause: error })
        }
      }
      throw new DataPersistenceError({ message: `Error reading the file ${storageKey} from the filesystem`, cause: error })
    }
  }

  async copyImage(sourceStorageKey: NonEmptyString, destinationStorageKey: NonEmptyString): Promise<void> {
    const sourcePath = path.resolve(this.imagesBasePath, sourceStorageKey.value)
    const destinationPath = path.resolve(this.imagesBasePath, destinationStorageKey.value)
    try {
      await fs.copyFile(sourcePath, destinationPath)
    } catch (error: unknown) {
      if (isErrnoException(error) && error.code === 'EEXIST') {
        return
      }
      throw new DataPersistenceError({
        message: `Error copying the file ${sourceStorageKey} to ${destinationStorageKey}`,
        cause: error
      })
    }
  }

  async deleteImage(storageKey: NonEmptyString) {
    const unlinkPath = `${this.imagesBasePath}/${storageKey.value}`
    try {
      await fs.unlink(unlinkPath)
    } catch (error: unknown) {
      throw new DataPersistenceError({ message: `Error removing the file ${storageKey} from the filesystem`, cause: error })
    }
    logger.debug('File removed successfully', storageKey.value)
  }

  async listAllStorageKeys(): Promise<MediaStorageKeyEntry[]> {
    try {
      const entries = await fs.readdir(this.imagesBasePath)
      const results: MediaStorageKeyEntry[] = []
      for (const entry of entries) {
        const stat = await fs.stat(path.join(this.imagesBasePath, entry))
        if (stat.isFile()) results.push({ key: entry, lastModified: stat.mtime })
      }
      return results
    } catch (error: unknown) {
      throw new DataPersistenceError({ message: 'Error listing files from the filesystem', cause: error })
    }
  }
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && typeof (err as NodeJS.ErrnoException).code === 'string'
}

function toFilesystemImagesPath(basePath: string): string {
  return `./${normalizeImagesBasePath(basePath)}`
}

function normalizeImagesBasePath(basePath: string): string {
  return basePath.replace(/^\.\//, '').replace(/\/$/, '')
}
