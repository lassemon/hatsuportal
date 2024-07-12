import { UserRole } from '@hatsuportal/domain'

export interface CreateUserRequestDTO {
  name: string
  email: string
  password: string
  roles: `${UserRole}`[]
}
