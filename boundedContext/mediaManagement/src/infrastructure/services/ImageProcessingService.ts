import { IImageProcessingService } from '../../application/services/IImageProcessingService'
import { Logger } from '@hatsuportal/common'
import webp from 'webp-converter'
import fileType from 'file-type'
import sharp from 'sharp'
import { ImageProcessingError } from '../../application/errors/ImageProcessingError'

webp.grant_permission()

const logger = new Logger('ImageProcessingService')

const defaultOptions = {
  width: 320
}

interface ResizeOptions {
  width: number
  height?: number
}

export class ImageProcessingService implements IImageProcessingService {
  async resizeImage(buffer: Buffer, resizeOptions: ResizeOptions) {
    const options = { ...defaultOptions, ...resizeOptions }
    try {
      const transformer = sharp(buffer).resize({
        width: options.width,
        height: options.height,
        withoutEnlargement: true,
        fit: 'inside'
      })

      return await transformer.png({ compressionLevel: 9, adaptiveFiltering: true, palette: true }).toBuffer()
    } catch (error) {
      logger.error(error)
      throw new ImageProcessingError({ message: 'Failed to process image', cause: error })
    }
  }

  async getBufferMimeType(buffer: Buffer) {
    const extractedFileType = await fileType.fromBuffer(buffer)
    return extractedFileType?.mime
  }
}
