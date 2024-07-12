import { ItemDTO } from '@hatsuportal/domain'

export interface SearchItemsResponseDTO {
  items: ItemDTO[]
  totalCount: number
}
