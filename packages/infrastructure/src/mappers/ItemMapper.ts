import { Item, ItemDTO, User } from '@hatsuportal/domain'
import { NotMutableUpdateProperties, OmitNotMutableUpdateProperties, PartialExceptFor, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  CreateItemRequestDTO,
  ItemResponseDTO,
  InsertItemQueryDTO,
  ItemMapperInterface,
  UpdateItemQueryDTO,
  UpdateItemRequestDTO
} from '@hatsuportal/application'
import _ from 'lodash'

export class ItemMapper implements ItemMapperInterface {
  createRequestToItem(createRequest: CreateItemRequestDTO, user: User): Item {
    const itemBlueprint: ItemDTO = {
      id: uuid(),
      visibility: createRequest.item.visibility,
      imageId: null,
      name: createRequest.item.name
        .split(' ')
        .map((namepart) => _.capitalize(namepart))
        .join(' '),
      description: createRequest.item.description,
      createdBy: user.id,
      createdByUserName: user.name,
      createdAt: unixtimeNow(),
      updatedAt: null
    }
    return new Item(itemBlueprint)
  }

  updateRequestToItem(existingItem: ItemDTO, updateItemRequest: UpdateItemRequestDTO): Item {
    const cleanedUpdate = _.omit(updateItemRequest.item, [...NotMutableUpdateProperties, 'updatedAt'])
    // easiest to use lodash merge here to avoid undefined members in updateRequest overwriting existing data to undefined
    return new Item(_.merge({}, existingItem, cleanedUpdate))
  }

  toInsertQuery(item: ItemDTO): InsertItemQueryDTO {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      imageId: item.imageId,
      visibility: item.visibility,
      createdBy: item.createdBy,
      createdByUserName: item.createdByUserName,
      createdAt: item.createdAt,
      updatedAt: null
    }
  }

  toUpdateQuery(item: PartialExceptFor<OmitNotMutableUpdateProperties<ItemDTO>, 'id'>): UpdateItemQueryDTO {
    const updatedAt = unixtimeNow()
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      imageId: item.imageId,
      visibility: item.visibility,
      updatedAt: updatedAt
    }
  }

  toItem(itemDTO: ItemDTO): Item {
    return new Item(itemDTO)
  }

  toResponse(item: ItemDTO): ItemResponseDTO {
    return { ...item }
  }
}
