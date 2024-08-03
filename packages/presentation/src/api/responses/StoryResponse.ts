import { VisibilityEnum } from '@hatsuportal/common'

export interface StoryResponse {
  id: string
  visibility: `${VisibilityEnum}`
  createdBy: string
  createdByUserName: string
  createdAt: number
  updatedAt: number | null
  imageId: string | null
  name: string
  description: string
}
