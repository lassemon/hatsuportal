import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IUserQueryMapper } from './mappers/UserQueryMapper'
import { UserId, IUserRepository } from '../../../domain'
import { NotFoundError } from '@hatsuportal/platform'

export class UserQueryFacade implements userV1.IUserQueryFacade {
  constructor(private readonly userRepository: IUserRepository, private readonly userQueryMapper: IUserQueryMapper) {}

  async getUserById(params: { userId: string }): Promise<userV1.UserContract> {
    const user = await this.userRepository.findById(new UserId(params.userId))
    if (!user) {
      throw new NotFoundError(`User '${params.userId}' not found`)
    }
    return this.userQueryMapper.toUserContract(user)
  }
}
