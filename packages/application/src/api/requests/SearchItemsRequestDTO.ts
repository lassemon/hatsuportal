import { ItemSortableKey, Order, Visibility } from '@hatsuportal/domain'

export interface SearchItemsRequestDTO {
  itemsPerPage?: number
  pageNumber?: number
  onlyMyItems?: boolean
  order: `${Order}`
  orderBy: ItemSortableKey
  search?: string
  visibility?: `${Visibility}`[]
  hasImage?: boolean | null
}
