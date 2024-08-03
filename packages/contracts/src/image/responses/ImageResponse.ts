import { EntityTypeEnum } from '@hatsuportal/common'
/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface ImageResponse {
  id: string
  createdById: string
  createdByName: string
  createdAt: number
  updatedAt: number
  fileName: string
  mimeType: string
  size: number
  ownerEntityId: string
  ownerEntityType: `${EntityTypeEnum}`
  base64: string
}
