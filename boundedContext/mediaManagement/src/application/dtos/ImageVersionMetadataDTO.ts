export interface ImageVersionMetadataDTO {
  id: string
  imageId: string
  storageKey: string
  mimeType: string
  size: number
  isCurrent: boolean
  isStaged: boolean
  createdAt: number
}
