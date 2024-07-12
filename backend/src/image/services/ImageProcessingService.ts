import fs from 'fs'
import { ImageProcessingServiceInterface } from '@hatsuportal/application'
import Jimp from 'jimp'
import webp from 'webp-converter'
import fileType from 'file-type'

const imagesBasePath = process.env.IMAGES_BASE_PATH || './images'

webp.grant_permission()

const defaultOptions = {
  width: 320,
  height: 320
}

interface ResizeOptions {
  width: number
  height?: number
}

export class ImageProcessingService implements ImageProcessingServiceInterface {
  async resizeImage(buffer: Buffer, resizeOptions: ResizeOptions) {
    const options = { ...defaultOptions, ...resizeOptions }
    try {
      // Detect the MIME type of the image
      const type = await fileType.fromBuffer(buffer)

      if (type && type.mime === 'image/webp') {
        // Process as WebP
        const inputWebpPath = `${imagesBasePath}/temp/temp.webp` // Consider using a unique filename or a temporary directory
        const outputPngPath = `${imagesBasePath}/temp/temp.png`

        // Write the WebP image to a temporary file
        await fs.promises.writeFile(inputWebpPath, buffer)

        // Convert WebP to PNG
        await webp.dwebp(inputWebpPath, outputPngPath, '-o')

        // Read the converted PNG file into a buffer
        const pngBuffer = await fs.promises.readFile(outputPngPath)

        // Resize the PNG buffer using Jimp
        const image = this.setImageResizeOptions(await Jimp.read(pngBuffer), options)
        const resizedBuffer = await image.getBufferAsync(Jimp.MIME_PNG)

        // Cleanup temporary files
        await fs.promises.unlink(inputWebpPath)
        await fs.promises.unlink(outputPngPath)

        return resizedBuffer
      } else {
        const image = this.setImageResizeOptions(await Jimp.read(buffer), options)
        return await image.getBufferAsync(Jimp.MIME_PNG)
      }
    } catch (error) {
      console.error('Error processing image:', error)
      throw new Error('Failed to process image')
    }
  }

  async getBufferMimeType(buffer: Buffer) {
    const extractedFileType = await fileType.fromBuffer(buffer)
    return extractedFileType?.mime
  }

  private setImageResizeOptions = (image: Jimp, options: ResizeOptions): Jimp => {
    const maxWidth = options.width
    let maxHeight = options.height || defaultOptions.height
    if (image.getWidth() > image.getHeight()) {
      maxHeight = 480
    }
    const ratio = Math.min(maxWidth / image.getWidth(), maxHeight / image.getHeight())
    const width = image.getWidth() * ratio
    const height = image.getHeight() * ratio

    // Process non-WebP images directly with Jimp
    image.filterType(Jimp.PNG_FILTER_NONE)
    image.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR)

    return image
  }
}
