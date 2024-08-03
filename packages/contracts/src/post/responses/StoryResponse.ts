import { ImageStateEnum, VisibilityEnum } from '@hatsuportal/common'
import { ImageResponse } from '../../image/responses/ImageResponse'

/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */

export interface ImageLoadErrorDTO {
  imageId: string
  error: string
}

export interface StoryResponse {
  id: string
  visibility: `${VisibilityEnum}`
  name: string
  description: string
  image: ImageResponse | null
  imageLoadState: ImageStateEnum
  imageLoadError: ImageLoadErrorDTO | null
  createdById: string
  createdByName: string
  createdAt: number
  updatedAt: number | null
}
