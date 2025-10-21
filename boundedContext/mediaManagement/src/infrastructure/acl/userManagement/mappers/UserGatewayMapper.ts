import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IUserGatewayMapper } from '../../../../application/acl/userManagement/mappers/IUserGatewayMapper'
import { UserReadModelDTO } from '../../../../application/dtos/UserReadModelDTO'
import { castToEnum, UserRoleEnum } from '@hatsuportal/foundation'

export class UserGatewayMapper implements IUserGatewayMapper {
  toUserReadModelDTO(user: userV1.UserContract): UserReadModelDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => castToEnum(role, UserRoleEnum)),
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
