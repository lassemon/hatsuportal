import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { User } from '../../../../domain'

export interface IUserQueryMapper {
  toUserContract(user: User): userV1.UserContract
}

export class UserQueryMapper implements IUserQueryMapper {
  public toUserContract(user: User): userV1.UserContract {
    return {
      id: user.id.toString(),
      name: user.name.toString(),
      email: user.email.toString(),
      roles: user.roles.map((role) => role.toString()),
      active: user.active,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value
    }
  }
}
