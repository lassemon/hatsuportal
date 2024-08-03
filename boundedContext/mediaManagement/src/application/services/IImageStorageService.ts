import { NonEmptyString } from '@hatsuportal/shared-kernel'

export type MediaStorageKeyEntry = {
  key: string
  lastModified: Date
}

export interface IImageStorageService {
  storeImageBuffer(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void>
  getImage(storageKey: NonEmptyString): Promise<string>
  renameImage(oldStorageKey: NonEmptyString, newStorageKey: NonEmptyString): Promise<void>
  deleteImage(storageKey: NonEmptyString): Promise<void>
  listAllStorageKeys(): Promise<MediaStorageKeyEntry[]>
}
