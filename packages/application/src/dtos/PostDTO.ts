import { VisibilityEnum } from '@hatsuportal/common'

export interface PostDTO {
  readonly id: string
  visibility: VisibilityEnum
  readonly createdBy: string
  readonly createdByUserName: string
  readonly createdAt: number
  updatedAt: number | null
}
