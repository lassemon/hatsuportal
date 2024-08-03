import { EntityTypeEnum, PartialExceptFor } from '@hatsuportal/common'

export interface UpdateImageInputDTO {
  loggedInUserId: string
  updateImageData: PartialExceptFor<
    {
      id: string
      fileName: string
      mimeType: string
      size: number
      ownerEntityId: string
      ownerEntityType: EntityTypeEnum
      base64: string
    },
    'id' | 'base64'
  >
}
