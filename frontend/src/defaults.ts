import { unixtimeNow } from '@hatsuportal/common'
import { Item, ItemDTO, Visibility } from '@hatsuportal/domain'

export const ITEM_DEFAULTS = {
  NEW_ITEM_ID: 'newItem'
}

export const defaultItem: ItemDTO = {
  id: 'defaultItem',
  description: 'description',
  imageId: null,
  name: 'Greatshield of Artorias',
  visibility: Visibility.Public,
  createdBy: '0',
  createdByUserName: 'system',
  createdAt: unixtimeNow(),
  updatedAt: null
}

export const newItemDTO = new Item({
  id: 'newItem',
  imageId: null,
  name: 'New Item',
  description: 'description',
  visibility: Visibility.Public,
  createdBy: '0',
  createdByUserName: '',
  createdAt: unixtimeNow(),
  updatedAt: null
})
