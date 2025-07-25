/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface UpdateUserRequest {
  id: string
  name?: string
  email?: string
  roles?: string[]
  active?: boolean
  oldPassword?: string
  newPassword?: string
}
