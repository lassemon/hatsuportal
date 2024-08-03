import { FileName } from '../../domain'

export interface IImageStorageService {
  writeImageBufferToFile(imageBuffer: Buffer, fileName: FileName): Promise<void>
  getImageFromFileSystem(fileName: FileName): Promise<string>
  renameImage(oldFileName: FileName, newFileName: FileName): Promise<void>
  deleteImageFromFileSystem(fileName: FileName): Promise<void>
}
