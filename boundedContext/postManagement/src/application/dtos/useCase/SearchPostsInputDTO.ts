import { EntityTypeEnum, OrderEnum, SortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { PostCreatorId } from '../../../domain'

export interface PostSearchCriteriaDTO {
  order: OrderEnum
  orderBy: SortableKeyEnum
  postsPerPage: number
  pageNumber: number
  loggedInCreatorId?: PostCreatorId
  search?: string
  visibility?: VisibilityEnum[]
  postType?: EntityTypeEnum
  /** True when the caller explicitly provided a visibility filter; false when the server resolved it. */
  isVisibilityUserProvided?: boolean
  /** True when the authenticated user holds the SuperAdmin role. */
  isSuperAdmin?: boolean
}
