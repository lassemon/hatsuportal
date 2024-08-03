import { UserRoleEnum } from '@hatsuportal/foundation'

export interface CreateUserInputDTO {
  name: string
  email: string
  password: string
  roles: UserRoleEnum[]
}
