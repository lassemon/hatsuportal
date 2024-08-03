import { PartialExceptFor, VisibilityEnum } from '@hatsuportal/common'
import { CreateImageInputDTO } from './CreateImageInputDTO'

export interface UpdateStoryInputDTO {
  loggedInUserId: string
  updateStoryData: PartialExceptFor<
    {
      id: string
      visibility: VisibilityEnum
      imageId: string
      name: string
      description: string
    },
    'id'
  >
  createImageInput?: CreateImageInputDTO
}
