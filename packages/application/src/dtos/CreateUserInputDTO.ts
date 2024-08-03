import { UserRoleEnum } from '@hatsuportal/common'

export interface CreateUserInputDTO {
  loggedInUserId: string
  creationData: {
    username: string
    email: string
    password: string
    roles: UserRoleEnum[]
  }
}
