import { VisibilityEnum } from '@hatsuportal/foundation'

export interface CreateStoryImageInputDTO {
  mimeType: string
  size: number
  base64: string
}

export interface CreateStoryInputDTO {
  visibility: VisibilityEnum
  image: CreateStoryImageInputDTO | null
  // TODO, allow creation of story with tags, add tagIds here
  name: string
  description: string
}
