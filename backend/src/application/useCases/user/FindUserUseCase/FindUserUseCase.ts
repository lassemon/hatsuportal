import { AuthorizationError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { IFindUserUseCase, IFindUserUseCaseOptions, IUserApplicationMapper } from '@hatsuportal/user-management'
import { IUserRepository, UserId } from '@hatsuportal/user-management'

export class FindUserUseCase implements IFindUserUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ findUserInput, userFound }: IFindUserUseCaseOptions): Promise<void> {
    const { loggedInUserId, userIdToFind } = findUserInput
    const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
    if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthorizationError('You are not authorized to find user details.')

    const foundUser = await this.userRepository.findById(new UserId(userIdToFind))
    if (!foundUser || !foundUser.active) {
      throw new NotFoundError()
    }
    userFound(this.userMapper.toDTO(foundUser))
  }
}
