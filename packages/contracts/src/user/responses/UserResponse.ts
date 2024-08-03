import { UserRoleEnum } from '@hatsuportal/common'

/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface UserResponse {
  id: string
  name: string
  email: string
  roles: `${UserRoleEnum}`[]
  createdAt: number
  updatedAt: number | null
}
