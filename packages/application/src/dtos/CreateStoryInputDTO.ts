import { VisibilityEnum } from '@hatsuportal/common'
import { CreateImageInputDTO } from './CreateImageInputDTO'

export interface CreateStoryInputDTO {
  loggedInUserId: string
  createStoryData: {
    visibility: VisibilityEnum
    imageId: string | null
    name: string
    description: string
  }
  createImageInput?: CreateImageInputDTO
}
