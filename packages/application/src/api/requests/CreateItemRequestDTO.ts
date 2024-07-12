import { OmitNotMutableCreationProperties } from '@hatsuportal/common'

import { CreateImageRequestDTO } from './CreateImageRequestDTO'
import { ItemDTO } from '@hatsuportal/domain'

export interface CreateItemRequestDTO {
  item: Omit<OmitNotMutableCreationProperties<ItemDTO>, 'imageId'>
  image: CreateImageRequestDTO | null
}
