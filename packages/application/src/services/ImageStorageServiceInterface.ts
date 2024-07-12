export interface ImageStorageServiceInterface {
  deleteImageFromFileSystem(fileName: string): Promise<void>
  writeImageBufferToFile(imageBuffer: Buffer, fileName: string): Promise<void>
}
