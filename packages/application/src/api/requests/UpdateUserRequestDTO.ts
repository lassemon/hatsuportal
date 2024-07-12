import { PartialExceptFor } from '@hatsuportal/common'
import { UserDTO } from '@hatsuportal/domain'

export interface UpdateUserRequest extends Omit<UserDTO, 'createdAt' | 'updatedAt'> {
  oldPassword: string
  newPassword: string
}
export interface UpdateUserRequestDTO extends PartialExceptFor<UpdateUserRequest, 'id'> {}
