/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface SearchStoriesRequest {
  storiesPerPage?: number
  pageNumber?: number
  onlyMyStories?: boolean
  order: string
  orderBy: string
  search?: string
  visibility?: string[]
  hasImage?: boolean | null
  tags?: string[]
}
