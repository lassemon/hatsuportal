import { OmitNotMutableUpdateProperties, PartialExceptFor } from '@hatsuportal/common'
import { ItemDTO } from '@hatsuportal/domain'

// id is always needed in update queries to find the existing entity record
export type UpdateItemQueryDTO = PartialExceptFor<OmitNotMutableUpdateProperties<ItemDTO>, 'id'>
