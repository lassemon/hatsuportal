import { PartialExceptFor, UserRoleEnum } from '@hatsuportal/common'

export interface UpdateUserInputDTO {
  loggedInUserId: string
  updateData: PartialExceptFor<
    {
      id: string
      name: string
      email: string
      roles: UserRoleEnum[]
      active: boolean
      oldPassword: string
      newPassword: string
    },
    'id'
  >
}
