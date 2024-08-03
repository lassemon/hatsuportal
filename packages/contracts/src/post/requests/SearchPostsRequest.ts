import { EntityTypeEnum } from '@hatsuportal/common'

/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface SearchPostsRequest {
  postsPerPage?: number
  pageNumber?: number
  postType?: EntityTypeEnum
  order: string
  orderBy: string
  search?: string
  visibility?: string[]
}
