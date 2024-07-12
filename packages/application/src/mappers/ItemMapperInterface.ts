import { Item, ItemDTO, User } from '@hatsuportal/domain'
import { ItemResponseDTO } from '../api/responses/ItemResponseDTO'
import { CreateItemRequestDTO } from '../api/requests/CreateItemRequestDTO'
import { InsertItemQueryDTO } from '../persistence/queries/InsertItemQueryDTO'
import { UpdateItemQueryDTO } from '../persistence/queries/UpdateItemQueryDTO'
import { UpdateItemRequestDTO } from '../api/requests/UpdateItemRequestDTO'

export interface ItemMapperInterface {
  createRequestToItem(createItemRequest: CreateItemRequestDTO, user: User): Item
  updateRequestToItem(existingItem: ItemDTO, updateItemRequest: UpdateItemRequestDTO): Item
  toInsertQuery(item: ItemDTO): InsertItemQueryDTO
  toUpdateQuery(item: ItemDTO): UpdateItemQueryDTO
  toItem(itemDTO: ItemDTO): Item
  toResponse(item: ItemDTO): ItemResponseDTO
}
