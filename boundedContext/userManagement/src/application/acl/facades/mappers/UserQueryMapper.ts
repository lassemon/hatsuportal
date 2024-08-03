import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { UserReadModelDTO } from '../../../dtos'

export interface IUserQueryMapper {
  toUserContract(user: UserReadModelDTO): userV1.UserContract
}

export class UserQueryMapper implements IUserQueryMapper {
  public toUserContract(user: UserReadModelDTO): userV1.UserContract {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
