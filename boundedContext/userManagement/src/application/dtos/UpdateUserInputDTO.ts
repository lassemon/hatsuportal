import { PartialExceptFor, UserRoleEnum } from '@hatsuportal/foundation'

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
