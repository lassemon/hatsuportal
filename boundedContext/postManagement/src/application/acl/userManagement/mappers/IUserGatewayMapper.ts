import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'

export interface IUserGatewayMapper {
  toUserReadModelDTO(user: userV1.UserContract): UserReadModelDTO
}
