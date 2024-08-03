import { UserRoleEnum } from '@hatsuportal/common'

export interface CreateUserInputDTO {
  name: string
  email: string
  password: string
  roles: UserRoleEnum[]
}
