import { EntityTypeEnum, VisibilityEnum } from '@hatsuportal/common'

export interface PostDTO {
  readonly id: string
  readonly visibility: VisibilityEnum
  readonly title: string
  readonly postType: EntityTypeEnum
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
}
