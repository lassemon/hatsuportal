import { PartialExceptFor, UserRoleEnum } from '@hatsuportal/common'

export type UpdateUserInputDTO = PartialExceptFor<
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
