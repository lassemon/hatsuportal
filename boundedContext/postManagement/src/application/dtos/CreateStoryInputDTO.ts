import { VisibilityEnum } from '@hatsuportal/common'

export interface CreateStoryImageInputDTO {
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
