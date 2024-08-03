import { UserRoleEnum } from '@hatsuportal/common'

export interface UserDatabaseSchema {
  id: string
  name: string
  password: string
  email: string
  roles: UserRoleEnum[] // postgre allows us to store json
  active: boolean | 0 | 1
  createdAt: number
  updatedAt: number
}
