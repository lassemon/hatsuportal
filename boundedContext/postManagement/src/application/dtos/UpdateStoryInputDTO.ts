import { PartialExceptFor, VisibilityEnum } from '@hatsuportal/common'

export interface UpdateStoryImageInputDTO {
  id: string
  mimeType: string
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
}
