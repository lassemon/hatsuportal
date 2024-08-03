export interface ImageVersionWithBase64DTO {
  id: string
  imageId: string
  storageKey: string
  mimeType: string
  size: number
  isCurrent: boolean
  isStaged: boolean
  createdAt: number
  base64: string
}
