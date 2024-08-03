import {
  ApplicationError,
  AuthorizationError,
  IFindUserUseCase,
  IFindUserUseCaseOptions,
  IUserApplicationMapper,
  NotFoundError
} from '@hatsuportal/application'
import { UserId, IUserRepository } from '@hatsuportal/domain'

export class FindUserUseCase implements IFindUserUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ findUserInput, userFound }: IFindUserUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, userIdToFind } = findUserInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthorizationError('You are not authorized to find user details.')

      const foundUser = await this.userRepository.findById(new UserId(userIdToFind))
      if (!foundUser || !foundUser.active) {
        throw new NotFoundError()
      }
      userFound(this.userMapper.toDTO(foundUser))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
