import { VisibilityEnum } from '@hatsuportal/common'
import { ImageResponse } from './ImageResponse'

export interface StoryResponse {
  id: string
  visibility: `${VisibilityEnum}`
  createdBy: string
  createdByUserName: string
  createdAt: number
  updatedAt: number | null
  image: ImageResponse | null
  name: string
  description: string
}
