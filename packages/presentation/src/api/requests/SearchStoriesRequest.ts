export interface SearchStoriesRequest {
  storiesPerPage?: number
  pageNumber?: number
  onlyMyStories?: boolean
  order: string
  orderBy: string
  search?: string
  visibility?: string[]
  hasImage?: boolean | null
}
