import {
  ApplicationError,
  AuthorizationError,
  IGetAllUsersUseCase,
  IGetAllUsersUseCaseOptions,
  IUserApplicationMapper
} from '@hatsuportal/application'
import { IUserRepository, UserId } from '@hatsuportal/domain'

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ loggedInUserId, allUsers }: IGetAllUsersUseCaseOptions): Promise<void> {
    try {
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser?.isAdmin()) throw new AuthorizationError('You are not authorized to see all users.')

      const users = await this.userRepository.getAll()
      allUsers(users.map((user) => this.userMapper.toDTO(user)))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
