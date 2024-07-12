import { ImageDTO, ItemDTO } from '@hatsuportal/domain'

export interface UpdateItemResponseDTO {
  item: ItemDTO
  image: ImageDTO | null
}
