import { ImageStateEnum, VisibilityEnum } from '@hatsuportal/common'
import { ImageWithRelationsResponse } from '../../image'
import { TagResponse } from './TagResponse'
import { CommentResponse } from './CommentResponse'
import { ImageLoadErrorDTO } from './ImageResponse'

/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */

export interface StoryResponse {
  id: string
  visibility: `${VisibilityEnum}`
  title: string
  body: string
  coverImageId: string | null
  createdById: string
  createdAt: number
  updatedAt: number | null
  tagIds: string[]
}

export interface CommentConnection {
  totalCount: number
  comments: CommentResponse[] // top-level comments for the story
  nextCursor: string | null
}

export interface StoryWithRelationsResponse extends Omit<StoryResponse, 'coverImageId' | 'tagIds'> {
  createdByName: string
  coverImage: ImageWithRelationsResponse | null
  // TODO, combine to image: {loadState, error} ?
  imageLoadState: ImageStateEnum
  imageLoadError: ImageLoadErrorDTO | null
  tags: TagResponse[]
  commentConnection: CommentConnection
}
