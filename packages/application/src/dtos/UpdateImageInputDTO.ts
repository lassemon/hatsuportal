import { PostTypeEnum, PartialExceptFor, VisibilityEnum } from '@hatsuportal/common'

export interface UpdateImageInputDTO {
  loggedInUserId: string
  updateImageData: PartialExceptFor<
    {
      id: string
      visibility: VisibilityEnum
      fileName: string
      mimeType: string
      size: number
      ownerId: string | null
      ownerType: PostTypeEnum
      base64: string
    },
    'id' | 'base64'
  >
}
