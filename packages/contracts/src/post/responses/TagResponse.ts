export interface TagResponse {
  id: string
  slug: string
  name: string
  createdById: string
  createdAt: number
  updatedAt: number
}

export interface TagListResponse {
  tags: TagResponse[]
  totalCount: number
}
