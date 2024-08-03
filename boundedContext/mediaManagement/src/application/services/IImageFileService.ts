import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { Base64Image, MimeType } from '../../domain'

export interface IImageFileService {
  convertBase64ImageToBuffer(base64Image: Base64Image): Buffer
  convertBufferToBase64Image(imageBuffer: Buffer, mimeType: MimeType): string
  resizeImageBuffer(imageBuffer: Buffer, targetWidth: number): Promise<Buffer>
  getBufferMimeType(buffer: Buffer): Promise<string | undefined>
  validateMimeType(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<MimeType>
}

export default IImageFileService
