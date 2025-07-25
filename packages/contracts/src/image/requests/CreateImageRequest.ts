/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface CreateImageRequest {
  fileName: string
  mimeType: string
  size: number
  ownerEntityId: string
  ownerEntityType: string
  base64: string
}
