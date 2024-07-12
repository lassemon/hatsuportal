import fs from 'fs'
import { ImageStorageServiceInterface } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import sanitize from 'sanitize-filename'
import { UnknownError } from '@hatsuportal/domain'

const logger = new Logger('ImageStorageService')

const imagesBasePath = process.env.IMAGES_BASE_PATH || './images'

export class ImageStorageService implements ImageStorageServiceInterface {
  async deleteImageFromFileSystem(fileName: string) {
    const unlinkPath = `${imagesBasePath}/${fileName}`
    fs.unlink(unlinkPath, (error) => {
      if (error) {
        throw new UnknownError(
          error.errno || 500,
          error.code || 'InternalServerError',
          `Error removing the file ${fileName} from the filesystem ${error.stack}`
        )
      }
      logger.debug('File removed successfully', fileName)
    })
  }

  async writeImageBufferToFile(imageBuffer: Buffer, fileName: string) {
    const sanitizedFileName = sanitize(fileName)
    const outputPath = `${imagesBasePath}/${sanitizedFileName}`
    fs.writeFile(outputPath, imageBuffer, (error) => {
      if (error) {
        throw new UnknownError(
          error.errno || 500,
          error.code || 'InternalServerError',
          `Error writing the file ${fileName} to the filesystem ${error.stack}`
        )
      }
    })
  }
}
