import { InvalidInputError } from '@hatsuportal/common-bounded-context'

import { Base64Image, FileName, MimeType } from '@hatsuportal/common-bounded-context'
import { IImageProcessingService, IImageFileService, IImageStorageService } from '@hatsuportal/common-bounded-context'

export class ImageFileService implements IImageFileService {
  constructor(
    private readonly imageProcessingService: IImageProcessingService,
    private readonly imageStorageService: IImageStorageService
  ) {}

  convertBase64ImageToBuffer(base64Image: Base64Image) {
    // Extract content type and base64 payload from the base64 image string
    const matches = base64Image.value.match(/^data:(.+);base64,(.*)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data')
    }

    const base64Payload = matches[2]
    return Buffer.from(base64Payload, 'base64')
  }

  convertBufferToBase64Image(imageBuffer: Buffer, mimeType: MimeType) {
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`
  }

  async resizeImageBuffer(imageBuffer: Buffer): Promise<Buffer> {
    return await this.imageProcessingService.resizeImage(imageBuffer, { width: 320 })
  }

  async validateMimeType(imageBuffer: Buffer, fileName: FileName): Promise<string> {
    const mimeType = await this.imageProcessingService.getBufferMimeType(imageBuffer)
    if (!mimeType) {
      throw new InvalidInputError(`Could not parse MimeType from base64 encoded image of '${fileName.value}'`)
    }
    return mimeType
  }

  async getBufferMimeType(buffer: Buffer) {
    return this.imageProcessingService.getBufferMimeType(buffer)
  }

  async writeImageToFileSystem(imageBuffer: Buffer, fileName: FileName): Promise<void> {
    return await this.imageStorageService.writeImageBufferToFile(imageBuffer, fileName)
  }

  async getImageFromFileSystem(fileName: FileName): Promise<string> {
    return await this.imageStorageService.getImageFromFileSystem(fileName)
  }

  async renameImageOnFileSystem(oldFileName: FileName, newFileName: FileName): Promise<void> {
    return await this.imageStorageService.renameImage(oldFileName, newFileName)
  }

  async deleteImageFromFileSystem(fileName: FileName): Promise<void> {
    return await this.imageStorageService.deleteImageFromFileSystem(fileName)
  }
}
