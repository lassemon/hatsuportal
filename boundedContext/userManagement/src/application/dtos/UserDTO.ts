import { UserRoleEnum } from '@hatsuportal/foundation'

export interface UserDTO {
  id: string
  name: string
  email: string
  roles: UserRoleEnum[]
  active: boolean
  createdAt: number
  updatedAt: number
}
