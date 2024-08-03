import { UserRoleEnum } from '@hatsuportal/foundation'

export interface UserDatabaseSchema {
  id: string
  name: string
  password: string
  email: string
  roles: UserRoleEnum[] // postgre allows us to store json
  active: boolean
  createdAt: number
  updatedAt: number
}
