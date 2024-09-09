import { ApiError, ImageMetadataDTO } from '@hatsuportal/domain'
import { IImageProcessingService, IImageService, IImageStorageService } from '@hatsuportal/application'
import mime from 'mime-types'

export class ImageService implements IImageService {
  constructor(
    private readonly imageProcessingService: IImageProcessingService,
    private readonly imageStorageService: IImageStorageService
  ) {}

  convertBase64ImageToBuffer(base64ImageData: string) {
    // Extract content type and base64 payload from the base64 image string
    const matches = base64ImageData.match(/^data:(.+);base64,(.*)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data')
    }

    const base64Payload = matches[2]
    return Buffer.from(base64Payload, 'base64')
  }

  convertBufferToBase64Image(imageBuffer: Buffer, metadata: ImageMetadataDTO) {
    return `data:${metadata.mimeType};base64,${imageBuffer.toString('base64')}`
  }

  parseImageFilename(metadata: ImageMetadataDTO) {
    const fileExtension = mime.extension(metadata.mimeType)
    return `${metadata.ownerType}_${metadata.createdBy}_${metadata.fileName}.${fileExtension}`
  }

  async resizeImageBuffer(imageBuffer: Buffer): Promise<Buffer> {
    return await this.imageProcessingService.resizeImage(imageBuffer, { width: 320 })
  }

  async validateMimeType(imageBuffer: Buffer, metadata: ImageMetadataDTO): Promise<string> {
    const mimeType = await this.imageProcessingService.getBufferMimeType(imageBuffer)
    if (!mimeType) {
      throw new ApiError(422, 'UnprocessableContent', `Could not parse MimeType from base64 encoded image of ${metadata.fileName}`)
    }
    return mimeType
  }

  async getBufferMimeType(buffer: Buffer) {
    return this.imageProcessingService.getBufferMimeType(buffer)
  }

  async writeImageToFileSystem(imageBuffer: Buffer, metadata: ImageMetadataDTO): Promise<void> {
    return await this.imageStorageService.writeImageBufferToFile(imageBuffer, metadata.fileName)
  }

  async getImageFromFileSystem(fileName: string): Promise<string> {
    return await this.imageStorageService.getImageFromFileSystem(fileName)
  }

  async deleteImageFromFileSystem(fileName: string): Promise<void> {
    return await this.imageStorageService.deleteImageFromFileSystem(fileName)
  }
}
