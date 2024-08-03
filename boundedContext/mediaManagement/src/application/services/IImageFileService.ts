import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { Base64Image, MimeType } from '../../domain'

export interface IImageFileService {
  convertBase64ImageToBuffer(base64Image: Base64Image): Buffer
  convertBufferToBase64Image(imageBuffer: Buffer, mimeType: MimeType): string
  resizeImageBuffer(imageBuffer: Buffer, targetWidth: number): Promise<Buffer>
  getBufferMimeType(buffer: Buffer): Promise<string | undefined>
  validateMimeType(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<MimeType>
  writeImageToFileSystem(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void>
  getImageFromFileSystem(storageKey: NonEmptyString): Promise<string>
  renameImageOnFileSystem(oldStorageKey: NonEmptyString, newStorageKey: NonEmptyString): Promise<void>
  deleteImageFromFileSystem(storageKey: NonEmptyString): Promise<void>
}

export default IImageFileService
