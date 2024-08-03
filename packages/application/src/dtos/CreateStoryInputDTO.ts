import { VisibilityEnum } from '@hatsuportal/common'

export interface CreateStoryImageInputDTO {
  visibility: VisibilityEnum
  mimeType: string
  size: number
  base64: string
}

export interface CreateStoryInputDTO {
  loggedInUserId: string
  createStoryData: {
    visibility: VisibilityEnum
    image: CreateStoryImageInputDTO | null
    name: string
    description: string
  }
}
