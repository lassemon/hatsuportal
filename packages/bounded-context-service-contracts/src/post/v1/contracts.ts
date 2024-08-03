import { VisibilityEnum } from '@hatsuportal/common'
import { ImageContract } from '../../media/v1'

export interface TagContract {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
}

export interface StoryContract {
  readonly id: string
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
  readonly visibility: VisibilityEnum
  readonly title: string
  readonly body: string
  readonly createdByName: string
  readonly coverImage: ImageContract | null
  readonly tags: TagContract[]
}
