export interface IImageStorageService {
  writeImageBufferToFile(imageBuffer: Buffer, fileName: string): Promise<void>
  getImageFromFileSystem(fileName: string): Promise<string>
  deleteImageFromFileSystem(fileName: string): Promise<void>
}
