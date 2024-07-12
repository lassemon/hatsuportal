import { PartialExceptFor } from '@hatsuportal/common'
import { UserDatabaseEntity } from '@hatsuportal/domain'

// id is always needed in update queries to find the existing entity record
export type UpdateUserQueryDTO = PartialExceptFor<Omit<UserDatabaseEntity, 'createdAt'>, 'id'>
