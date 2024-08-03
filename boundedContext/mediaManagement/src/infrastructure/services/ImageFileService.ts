import { IImageFileService } from '../../application/services/IImageFileService'
import { IImageProcessingService } from '../../application/services/IImageProcessingService'
import { IImageStorageService } from '../../application/services/IImageStorageService'
import { Base64Image, FileName, MimeType } from '../../domain'
import { InvalidInputError } from '@hatsuportal/platform'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

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

  async resizeImageBuffer(imageBuffer: Buffer, targetWidth: number): Promise<Buffer> {
    return await this.imageProcessingService.resizeImage(imageBuffer, { width: targetWidth })
  }

  async validateMimeType(imageBuffer: Buffer, fileName: FileName): Promise<MimeType> {
    const mimeType = await this.imageProcessingService.getBufferMimeType(imageBuffer)
    if (!mimeType) {
      throw new InvalidInputError(`Could not parse MimeType from base64 encoded image of '${fileName.value}'`)
    }
    return new MimeType(mimeType)
  }

  async getBufferMimeType(buffer: Buffer) {
    return this.imageProcessingService.getBufferMimeType(buffer)
  }

  async writeImageToFileSystem(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void> {
    return await this.imageStorageService.writeImageBufferToFile(imageBuffer, storageKey)
  }

  async getImageFromFileSystem(storageKey: NonEmptyString): Promise<string> {
    return await this.imageStorageService.getImageFromFileSystem(storageKey)
  }

  async renameImageOnFileSystem(oldStorageKey: NonEmptyString, newStorageKey: NonEmptyString): Promise<void> {
    return await this.imageStorageService.renameImage(oldStorageKey, newStorageKey)
  }

  async deleteImageFromFileSystem(storageKey: NonEmptyString): Promise<void> {
    return await this.imageStorageService.deleteImageFromFileSystem(storageKey)
  }
}
