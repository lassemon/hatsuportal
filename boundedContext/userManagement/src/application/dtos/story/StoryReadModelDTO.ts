import { VisibilityEnum } from '@hatsuportal/common'
import { CoverImageWithRelationsDTO } from './CoverImageWithRelationsDTO'
import { TagReadModelDTO } from './TagReadModelDTO'

export interface StoryReadModelDTO {
  readonly id: string
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
  readonly visibility: VisibilityEnum
  readonly name: string
  readonly description: string
  readonly createdByName: string
  readonly coverImage: CoverImageWithRelationsDTO | null
  readonly tags: TagReadModelDTO[]
}
