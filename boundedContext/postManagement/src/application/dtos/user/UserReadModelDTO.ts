import { UserRoleEnum } from '@hatsuportal/foundation'

export interface UserReadModelDTO {
  id: string
  name: string
  email: string
  roles: UserRoleEnum[]
  active: boolean
  createdAt: number
  updatedAt: number
}
