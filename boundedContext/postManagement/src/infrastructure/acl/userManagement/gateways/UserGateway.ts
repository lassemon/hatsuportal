import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IUserGateway } from '../../../../application/acl/userManagement/IUserGateway'
import { IUserGatewayMapper } from '../../../../application/acl/userManagement/mappers/IUserGatewayMapper'
import { UserReadModelDTO } from '../../../../application/dtos/user/UserReadModelDTO'
import { UserLoadResult } from '../../../../application/acl/userManagement/outcomes/UserLoadResult'
import { UserLoadError } from '../../../../application/acl/userManagement/errors/UserLoadError'

export class UserGateway implements IUserGateway {
  constructor(
    private readonly userQueryFacade: userV1.IUserQueryFacade,
    //private readonly userCommandFacade: userV1.IUserCommandFacade, // For future reference, CRUD a user
    private readonly userGatewayMapper: IUserGatewayMapper
  ) {}

  async getUserById(params: { userId: string }): Promise<UserLoadResult<UserReadModelDTO, UserLoadError>> {
    try {
      const user = await this.userQueryFacade.getUserById(params)
      return UserLoadResult.success(this.userGatewayMapper.toUserReadModelDTO(user))
    } catch (error) {
      return UserLoadResult.failedToLoad(params.userId, error as Error)
    }
  }
}
