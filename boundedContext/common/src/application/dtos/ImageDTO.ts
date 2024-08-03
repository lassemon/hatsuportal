import { EntityTypeEnum } from '@hatsuportal/common'

export interface ImageDTO {
  readonly id: string
  fileName: string
  mimeType: string
  readonly size: number
  ownerEntityId: string
  ownerEntityType: EntityTypeEnum
  base64: string
  readonly createdById: string
  readonly createdByName: string
  readonly createdAt: number
  updatedAt: number
}
