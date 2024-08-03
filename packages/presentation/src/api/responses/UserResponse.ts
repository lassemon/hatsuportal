import { UserRoleEnum } from '@hatsuportal/common'

export interface UserResponse {
  id: string
  name: string
  email: string
  roles: `${UserRoleEnum}`[]
  createdAt: number
  updatedAt: number | null
}
