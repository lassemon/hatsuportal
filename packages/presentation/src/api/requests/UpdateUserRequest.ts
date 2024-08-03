import { PartialExceptFor } from '@hatsuportal/common'

export interface UpdateUserRequest
  extends PartialExceptFor<
    {
      id: string
      username: string
      email: string
      roles: string[]
      active: boolean
      oldPassword: string
      newPassword: string
    },
    'id'
  > {}
