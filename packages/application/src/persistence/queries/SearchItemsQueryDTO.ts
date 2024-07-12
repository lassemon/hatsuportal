import { ItemSortFields, Order, Visibility } from '@hatsuportal/domain'

export interface SearchItemsQueryDTO {
  order: `${Order}`
  orderBy: (typeof ItemSortFields)[number]
  itemsPerPage?: number
  pageNumber?: number
  userId?: string
  onlyMyItems?: boolean
  search?: string
  visibility?: `${Visibility}`[]
  hasImage?: boolean | null
}
