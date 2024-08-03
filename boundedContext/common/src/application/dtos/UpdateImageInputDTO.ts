import { EntityTypeEnum, PartialExceptFor } from '@hatsuportal/common'

export interface UpdateImageInputDTO {
  loggedInUserId: string
  updateImageData: PartialExceptFor<
    {
      id: string
      fileName: string
      mimeType: string
      size: number
      base64: string
      ownerEntityId: string
      ownerEntityType: EntityTypeEnum
    },
    'id' | 'base64'
  >
}
