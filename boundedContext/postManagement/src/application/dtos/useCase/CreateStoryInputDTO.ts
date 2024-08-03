import { VisibilityEnum } from '@hatsuportal/common'
import { TagInputDTO } from './TagInputDTO'

export interface CreateStoryImageInputDTO {
  mimeType: string
  size: number
  base64: string
}

export interface CreateStoryInputDTO {
  visibility: VisibilityEnum
  image: CreateStoryImageInputDTO | null
  name: string
  description: string
  tags: TagInputDTO[]
}
