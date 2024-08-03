import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IUserGateway } from '../../../../application/acl/userManagement/IUserGateway'
import { IUserGatewayMapper } from '../../../../application/acl/userManagement/mappers/IUserGatewayMapper'
import { UserReadModelDTO } from '../../../../application/dtos/user/UserReadModelDTO'
import { UserLoadError } from '../../../../application/acl/userManagement/errors/UserLoadError'
import { EntityLoadResult, ApplicationError } from '@hatsuportal/platform'

export class UserGateway implements IUserGateway {
  constructor(
    private readonly userQueryFacade: userV1.IUserQueryFacade,
    //private readonly userCommandFacade: userV1.IUserCommandFacade, // For future reference, CRUD a user
    private readonly userGatewayMapper: IUserGatewayMapper
  ) {}

  async getUserById(params: { userId: string }): Promise<EntityLoadResult<UserReadModelDTO, UserLoadError>> {
    try {
      const user = await this.userQueryFacade.getUserById(params)
      return EntityLoadResult.success(this.userGatewayMapper.toUserReadModelDTO(user))
    } catch (error) {
      if (error instanceof Error) {
        return EntityLoadResult.failure(new UserLoadError({ userId: params.userId, error }))
      } else {
        return EntityLoadResult.failure(
          new UserLoadError({
            userId: params.userId,
            error: new ApplicationError({ message: 'Unknown error occurred', cause: error })
          })
        )
      }
    }
  }
}
