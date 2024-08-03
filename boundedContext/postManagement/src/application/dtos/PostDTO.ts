import { VisibilityEnum } from '@hatsuportal/common'

export interface PostDTO {
  readonly id: string
  visibility: VisibilityEnum
  readonly createdById: string
  readonly createdByName: string
  readonly createdAt: number
  updatedAt: number
}
