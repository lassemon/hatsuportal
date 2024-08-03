import { EntityTypeEnum } from '@hatsuportal/common'

export interface CreateImageInputDTO {
  loggedInUserId: string
  createImageData: {
    fileName: string
    mimeType: string
    size: number
    base64: string
    ownerEntityId: string
    ownerEntityType: EntityTypeEnum
  }
}
