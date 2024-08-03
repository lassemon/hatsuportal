import path from 'path'
import { promises as fs } from 'node:fs'
import sanitize from 'sanitize-filename'
import { IImageStorageService } from '../../application/services/IImageStorageService'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { BASE64_PNG_PREFIX, DataPersistenceError } from '@hatsuportal/platform'
import { NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('ImageStorageService')

const imagesBasePath = process.env.IMAGES_BASE_PATH || './images'

export class ImageStorageService implements IImageStorageService {
  async writeImageBufferToFile(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void> {
    const sanitizedStorageKey = sanitize(storageKey.value)
    const outputPath = `${imagesBasePath}/${sanitizedStorageKey}`
    try {
      await fs.writeFile(outputPath, imageBuffer)
    } catch (error: unknown) {
      throw new DataPersistenceError({ message: `Error writing the file ${storageKey} to the filesystem`, cause: error })
    }
  }

  async getImageFromFileSystem(storageKey: NonEmptyString): Promise<string> {
    try {
      const imagePath = path.resolve(imagesBasePath, storageKey.value)
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

  async renameImage(oldStorageKey: NonEmptyString, newStorageKey: NonEmptyString): Promise<void> {
    const oldPath = path.resolve(imagesBasePath, oldStorageKey.value)
    const newPath = path.resolve(imagesBasePath, newStorageKey.value)
    try {
      await fs.rename(oldPath, newPath)
    } catch (error: unknown) {
      if (isErrnoException(error) && error.code === 'EEXIST') {
        // Windows or exotic FS: remove first, then rename
        await fs.unlink(newPath)
        await fs.rename(oldPath, newPath)
        return
      }
      throw new DataPersistenceError({ message: `Error renaming the file ${oldStorageKey} to ${newStorageKey}`, cause: error })
    }
  }

  async deleteImageFromFileSystem(storageKey: NonEmptyString) {
    const unlinkPath = `${imagesBasePath}/${storageKey.value}`
    try {
      console.log('unlinkPath', unlinkPath)
      await fs.unlink(unlinkPath)
    } catch (error: unknown) {
      throw new DataPersistenceError({ message: `Error removing the file ${storageKey} from the filesystem`, cause: error })
    }
    logger.debug('File removed successfully', storageKey)
  }
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && typeof (err as NodeJS.ErrnoException).code === 'string'
}
