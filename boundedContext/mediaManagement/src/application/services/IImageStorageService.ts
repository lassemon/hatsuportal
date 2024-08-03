import { NonEmptyString } from '@hatsuportal/shared-kernel'

export interface IImageStorageService {
  writeImageBufferToFile(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void>
  getImageFromFileSystem(storageKey: NonEmptyString): Promise<string>
  renameImage(oldStorageKey: NonEmptyString, newStorageKey: NonEmptyString): Promise<void>
  deleteImageFromFileSystem(storageKey: NonEmptyString): Promise<void>
}
