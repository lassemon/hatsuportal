import { EntityTypeEnum } from '@hatsuportal/common'

export interface CreateImageInputDTO {
  loggedInUserId: string
  createImageData: {
    fileName: string
    mimeType: string
    size: number
    ownerEntityId: string
    ownerEntityType: EntityTypeEnum
    base64: string
  }
}
