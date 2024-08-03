import { PostTypeEnum, VisibilityEnum } from '@hatsuportal/common'

export interface ImageResponse {
  id: string
  visibility: `${VisibilityEnum}`
  createdBy: string
  createdByUserName: string
  createdAt: number
  updatedAt: number | null
  fileName: string
  mimeType: string
  size: number
  ownerId: string | null
  ownerType: `${PostTypeEnum}`
  base64: string
}
