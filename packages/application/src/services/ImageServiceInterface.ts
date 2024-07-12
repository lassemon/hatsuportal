import { ImageMetadata, ImageMetadataDTO } from '@hatsuportal/domain'

export interface ImageServiceInterface {
  convertBase64ImageToBuffer(base64ImageData: string): Buffer
  convertBufferToBase64Image(imageBuffer: Buffer, metadata: ImageMetadataDTO): string
  parseImageFilename(metadata: ImageMetadataDTO): string
  resizeImageBuffer(imageBuffer: Buffer): Promise<Buffer>
  getBufferMimeType(buffer: Buffer): Promise<string | undefined>
  validateMimeType(imageBuffer: Buffer, metadata: ImageMetadataDTO): Promise<string>
  writeImageToFileSystem(imageBuffer: Buffer, metadata: ImageMetadataDTO): void
  getImageFromFileSystem(fileName: string): Promise<string>
  deleteImageFromFileSystem(fileName: string): void
}

export default ImageServiceInterface
