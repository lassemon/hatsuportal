import path from 'path'
import { promises as fs } from 'node:fs'
import { BASE64_PREFIX, Logger } from '@hatsuportal/common'
import { DataPersistenceError, NotFoundError } from '@hatsuportal/common-bounded-context'
import sanitize from 'sanitize-filename'
import { FileName } from '@hatsuportal/common-bounded-context'
import { IImageStorageService } from '@hatsuportal/common-bounded-context'

const logger = new Logger('ImageStorageService')

const imagesBasePath = process.env.IMAGES_BASE_PATH || './images'

export class ImageStorageService implements IImageStorageService {
  async writeImageBufferToFile(imageBuffer: Buffer, fileName: FileName): Promise<void> {
    const sanitizedFileName = new FileName(sanitize(fileName.value))
    const outputPath = `${imagesBasePath}/${sanitizedFileName.value}`
    try {
      await fs.writeFile(outputPath, imageBuffer)
    } catch (error: unknown) {
      throw new DataPersistenceError({ message: `Error writing the file ${fileName} to the filesystem`, cause: error })
    }
  }

  async getImageFromFileSystem(fileName: FileName): Promise<string> {
    try {
      const imagePath = path.resolve(imagesBasePath, fileName.value)
      const imageBuffer = await fs.readFile(imagePath)
      let imageBase64 = imageBuffer.toString('base64')

      if (!imageBase64.startsWith(BASE64_PREFIX)) imageBase64 = `${BASE64_PREFIX},${imageBase64}`

      return imageBase64
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('no such file')) {
          logger.error(error.stack)
          throw new NotFoundError({ message: `Error reading the file ${fileName} from the filesystem`, cause: error })
        }
      }
      throw new DataPersistenceError({ message: `Error reading the file ${fileName} from the filesystem`, cause: error })
    }
  }

  async renameImage(oldFileName: FileName, newFileName: FileName): Promise<void> {
    const oldPath = path.resolve(imagesBasePath, oldFileName.value)
    const newPath = path.resolve(imagesBasePath, newFileName.value)
    try {
      await fs.rename(oldPath, newPath)
    } catch (error: unknown) {
      if (isErrnoException(error) && error.code === 'EEXIST') {
        // Windows or exotic FS: remove first, then rename
        await fs.unlink(newPath)
        await fs.rename(oldPath, newPath)
        return
      }
      throw new DataPersistenceError({ message: `Error renaming the file ${oldFileName} to ${newFileName}`, cause: error })
    }
  }

  async deleteImageFromFileSystem(fileName: FileName) {
    const unlinkPath = `${imagesBasePath}/${fileName.value}`
    try {
      await fs.unlink(unlinkPath)
    } catch (error: unknown) {
      throw new DataPersistenceError({ message: `Error removing the file ${fileName} from the filesystem`, cause: error })
    }
    logger.debug('File removed successfully', fileName)
  }
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && typeof (err as NodeJS.ErrnoException).code === 'string'
}
