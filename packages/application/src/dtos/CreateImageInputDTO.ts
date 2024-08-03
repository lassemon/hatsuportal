import { PostTypeEnum, VisibilityEnum } from '@hatsuportal/common'

export interface CreateImageInputDTO {
  loggedInUserId: string
  createImageData: {
    visibility: VisibilityEnum
    fileName: string
    mimeType: string
    size: number
    ownerId: string
    ownerType: PostTypeEnum
    base64: string
  }
}
