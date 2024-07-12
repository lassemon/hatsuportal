import { ImageDTO, ItemDTO } from '@hatsuportal/domain'

export interface CreateItemResponseDTO {
  item: ItemDTO
  image: ImageDTO | null
}
