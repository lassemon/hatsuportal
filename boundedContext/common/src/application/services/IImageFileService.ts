import { Base64Image, FileName, MimeType } from '../../domain'

export interface IImageFileService {
  convertBase64ImageToBuffer(base64Image: Base64Image): Buffer
  convertBufferToBase64Image(imageBuffer: Buffer, mimeType: MimeType): string
  resizeImageBuffer(imageBuffer: Buffer): Promise<Buffer>
  getBufferMimeType(buffer: Buffer): Promise<string | undefined>
  validateMimeType(imageBuffer: Buffer, fileName: FileName): Promise<string>
  writeImageToFileSystem(imageBuffer: Buffer, fileName: FileName): Promise<void>
  getImageFromFileSystem(fileName: FileName): Promise<string>
  renameImageOnFileSystem(oldFileName: FileName, newFileName: FileName): Promise<void>
  deleteImageFromFileSystem(fileName: FileName): Promise<void>
}

export default IImageFileService
