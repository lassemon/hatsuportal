export interface CreateImageRequest {
  visibility: string
  fileName: string
  mimeType: string
  size: number
  ownerId?: string
  ownerType?: string
  base64: string
}
