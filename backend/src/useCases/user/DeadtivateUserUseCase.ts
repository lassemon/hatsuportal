import { ApplicationError, AuthorizationError, IDeactivateUserUseCase, IDeactivateUserUseCaseOptions } from '@hatsuportal/application'
import { IUserRepository, UserId } from '@hatsuportal/domain'

export class DeactivateUserUseCase implements IDeactivateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute({ deactivateUserInput }: IDeactivateUserUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, userIdToDeactivate } = deactivateUserInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin() || loggedInUser.id.value !== userIdToDeactivate) {
        throw new AuthorizationError(
          `Access denied for ${loggedInUser?.id} deactivating ${userIdToDeactivate}: Only admin users or the user themselves can deactivate a user.`
        )
      }

      await this.userRepository.deactivate(new UserId(userIdToDeactivate))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
