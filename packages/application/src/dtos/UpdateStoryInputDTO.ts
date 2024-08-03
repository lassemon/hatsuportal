import { PartialExceptFor, VisibilityEnum } from '@hatsuportal/common'
import { CreateImageInputDTO } from './CreateImageInputDTO'

export interface UpdateStoryImageInputDTO {
  id: string
  visibility?: string
  mimeType?: string
  size: number
  base64: string
}
export interface UpdateStoryInputDTO {
  loggedInUserId: string
  updateStoryData: PartialExceptFor<
    {
      id: string
      visibility: VisibilityEnum
      image: UpdateStoryImageInputDTO | null
      name: string
      description: string
    },
    'id'
  >
  createImageInput?: CreateImageInputDTO
}
