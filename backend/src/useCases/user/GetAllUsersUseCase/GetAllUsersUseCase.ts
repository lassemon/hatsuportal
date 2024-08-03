import { AuthorizationError, ApplicationError } from '@hatsuportal/common-bounded-context'
import {
  IGetAllUsersUseCase,
  IGetAllUsersUseCaseOptions,
  IUserApplicationMapper,
  IUserRepository,
  UserId
} from '@hatsuportal/user-management'

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ loggedInUserId, allUsers }: IGetAllUsersUseCaseOptions): Promise<void> {
    try {
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser?.isAdmin()) throw new AuthorizationError('You are not authorized to see all users.')

      const users = await this.userRepository.getAll()
      allUsers(users.map((user) => this.userMapper.toDTO(user)))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
