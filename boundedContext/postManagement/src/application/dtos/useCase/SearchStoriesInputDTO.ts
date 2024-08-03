import { OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { PostCreatorId } from '../../../domain'

export interface StorySearchCriteriaDTO {
  order: OrderEnum
  orderBy: StorySortableKeyEnum
  storiesPerPage: number
  pageNumber: number
  loggedInCreatorId?: PostCreatorId
  onlyMyStories?: boolean
  search?: string
  visibility?: VisibilityEnum[]
  hasImage?: boolean | null
}
