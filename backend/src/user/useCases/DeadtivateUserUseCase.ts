import { IDeactivateUserUseCase, IDeactivateUserUseCaseOptions, InsertUserQueryDTO, UpdateUserQueryDTO } from '@hatsuportal/application'
import { ApiError, IUserRepository } from '@hatsuportal/domain'

export class DeactivateUserUseCase implements IDeactivateUserUseCase {
  constructor(private readonly userRepository: IUserRepository<InsertUserQueryDTO, UpdateUserQueryDTO>) {}

  async execute({ user, userId }: IDeactivateUserUseCaseOptions): Promise<void> {
    if (!user.isAdmin() && user.id !== userId) {
      throw new ApiError(
        403,
        'Forbidden',
        `Access denied for ${user.id} deactivating ${userId}: Only admin users or the user themselves can deactivate a user.`
      )
    }

    await this.userRepository.deactivate(userId)
  }
}
