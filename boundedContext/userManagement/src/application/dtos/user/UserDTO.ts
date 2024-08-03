import { UserRoleEnum } from '@hatsuportal/common'

export interface UserDTO {
  id: string
  name: string
  email: string
  roles: UserRoleEnum[]
  active: boolean
  createdAt: number
  updatedAt: number
}
