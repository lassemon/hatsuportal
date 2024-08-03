import { EntityTypeEnum, ImageStateEnum, VisibilityEnum } from '@hatsuportal/common'
import { ImageWithRelationsResponse } from '../../image'
import { TagResponse } from './TagResponse'
import { ImageLoadErrorDTO } from './ImageResponse'

export interface PostResponse {
  id: string
  visibility: `${VisibilityEnum}`
  title: string
  postType: EntityTypeEnum
  coverImageId: string | null
  createdById: string
  createdAt: number
  updatedAt: number | null
  tagIds: string[]
}

export interface PostWithRelationsResponse extends PostResponse {
  createdByName: string
  coverImage: ImageWithRelationsResponse | null
  imageLoadState: ImageStateEnum
  imageLoadError: ImageLoadErrorDTO | null
  tags: TagResponse[]
}
