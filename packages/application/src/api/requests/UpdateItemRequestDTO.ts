import { OmitNotMutableUpdateProperties, PartialExceptFor } from '@hatsuportal/common'
import { ImageDTO } from '@hatsuportal/domain'
import { ItemDTO } from '@hatsuportal/domain'

export interface UpdateItemRequestDTO {
  item: PartialExceptFor<OmitNotMutableUpdateProperties<ItemDTO>, 'id'>
  image: OmitNotMutableUpdateProperties<ImageDTO> | null
}
