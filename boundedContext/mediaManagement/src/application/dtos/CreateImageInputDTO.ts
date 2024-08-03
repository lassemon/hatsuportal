import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/foundation'

export interface CreateImageInputDTO {
  ownerEntityType: EntityTypeEnum
  ownerEntityId: string
  role: ImageRoleEnum
  mimeType: string
  size: number
  base64: string
}
