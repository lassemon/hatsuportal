import { UserRoleEnum } from '@hatsuportal/common'

export interface CreateUserInputDTO {
  loggedInUserId: string
  creationData: {
    name: string
    email: string
    password: string
    roles: UserRoleEnum[]
  }
}
