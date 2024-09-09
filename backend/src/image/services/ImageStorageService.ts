import path from 'path'
import { promises as fs } from 'node:fs'
import { IImageStorageService } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import sanitize from 'sanitize-filename'
import { UnknownError } from '@hatsuportal/domain'

const logger = new Logger('ImageStorageService')

const imagesBasePath = process.env.IMAGES_BASE_PATH || './images'

export class ImageStorageService implements IImageStorageService {
  async writeImageBufferToFile(imageBuffer: Buffer, fileName: string): Promise<void> {
    const sanitizedFileName = sanitize(fileName)
    const outputPath = `${imagesBasePath}/${sanitizedFileName}`
    try {
      await fs.writeFile(outputPath, imageBuffer)
    } catch (error: any) {
      if (error) {
        throw new UnknownError(
          error.errno || 500,
          error.code || 'InternalServerError',
          `Error writing the file ${fileName} to the filesystem ${error.stack}`
        )
      }
    }
  }

  async getImageFromFileSystem(fileName: string): Promise<string> {
    const imagePath = path.resolve(imagesBasePath, fileName)
    const imageBuffer = await fs.readFile(imagePath)
    const imageBase64 = imageBuffer.toString('base64')
    return imageBase64
  }

  async deleteImageFromFileSystem(fileName: string) {
    const unlinkPath = `${imagesBasePath}/${fileName}`
    try {
      await fs.unlink(unlinkPath)
    } catch (error: any) {
      if (error) {
        throw new UnknownError(
          error.errno || 500,
          error.code || 'InternalServerError',
          `Error removing the file ${fileName} from the filesystem ${error.stack}`
        )
      }
      logger.debug('File removed successfully', fileName)
    }
  }
}
