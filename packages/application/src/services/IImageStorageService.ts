import { FileName } from '@hatsuportal/domain'

export interface IImageStorageService {
  writeImageBufferToFile(imageBuffer: Buffer, fileName: FileName): Promise<void>
  getImageFromFileSystem(fileName: FileName): Promise<string>
  deleteImageFromFileSystem(fileName: FileName): Promise<void>
}
