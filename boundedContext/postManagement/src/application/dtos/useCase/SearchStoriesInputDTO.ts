import { OrderEnum, SortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { PostCreatorId } from '../../../domain'

export interface StorySearchCriteriaDTO {
  order: OrderEnum
  orderBy: SortableKeyEnum
  storiesPerPage: number
  pageNumber: number
  loggedInCreatorId?: PostCreatorId
  onlyMyStories?: boolean
  search?: string
  visibility?: VisibilityEnum[]
  hasImage?: boolean | null
}
