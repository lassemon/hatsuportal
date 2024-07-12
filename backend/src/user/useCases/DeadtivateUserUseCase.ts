import { InsertUserQueryDTO, UpdateUserQueryDTO, UseCaseInterface, UseCaseOptionsInterface } from '@hatsuportal/application'
import { ApiError, User, UserRepositoryInterface } from '@hatsuportal/domain'

export interface DeactivateUserUseCaseOptions extends UseCaseOptionsInterface {
  user: User
  userId: string
}

export type DeactivateUserUseCaseInterface = UseCaseInterface<DeactivateUserUseCaseOptions, void>

export class DeactivateUserUseCase implements DeactivateUserUseCaseInterface {
  constructor(private readonly userRepository: UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO>) {}

  async execute({ user, userId }: DeactivateUserUseCaseOptions): Promise<void> {
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
