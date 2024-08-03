import path from 'path'
import { promises as fs } from 'node:fs'
import { ApplicationError, DataPersistenceError, IImageStorageService, NotFoundError } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import sanitize from 'sanitize-filename'
import { FileName } from '@hatsuportal/domain'

const logger = new Logger('ImageStorageService')

const imagesBasePath = process.env.IMAGES_BASE_PATH || './images'

export class ImageStorageService implements IImageStorageService {
  async writeImageBufferToFile(imageBuffer: Buffer, fileName: FileName): Promise<void> {
    const sanitizedFileName = new FileName(sanitize(fileName.value))
    const outputPath = `${imagesBasePath}/${sanitizedFileName}`
    try {
      await fs.writeFile(outputPath, imageBuffer)
    } catch (error: any) {
      if (error) {
        throw new DataPersistenceError(`Error writing the file ${fileName} to the filesystem`)
      }
    }
  }

  async getImageFromFileSystem(fileName: FileName): Promise<string> {
    try {
      const imagePath = path.resolve(imagesBasePath, fileName.value)
      const imageBuffer = await fs.readFile(imagePath)
      const imageBase64 = imageBuffer.toString('base64')

      return imageBase64
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('no such file')) {
          logger.error(error.stack)
          throw new NotFoundError()
        }
        throw new ApplicationError(error.stack || error.message)
      }

      throw new ApplicationError(String(error))
    }
  }

  async deleteImageFromFileSystem(fileName: FileName) {
    const unlinkPath = `${imagesBasePath}/${fileName}`
    try {
      await fs.unlink(unlinkPath)
    } catch (error: any) {
      if (error) {
        throw new DataPersistenceError(`Error removing the file ${fileName} from the filesystem`)
      }
      logger.debug('File removed successfully', fileName)
    }
  }
}
