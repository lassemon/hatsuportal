import { EntityTypeEnum } from '@hatsuportal/common'

export interface PostDTO {
  readonly id: string
  readonly postType: EntityTypeEnum
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
}
