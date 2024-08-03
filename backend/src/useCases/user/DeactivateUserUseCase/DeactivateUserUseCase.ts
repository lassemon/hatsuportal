import { ITransactionManager } from '@hatsuportal/common-bounded-context'
import {
  IDeactivateUserUseCase,
  IDeactivateUserUseCaseOptions,
  IUserApplicationMapper,
  IUserRepository,
  UserId
} from '@hatsuportal/user-management'

export class DeactivateUserUseCase implements IDeactivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({ deactivateUserInput, userDeactivated }: IDeactivateUserUseCaseOptions): Promise<void> {
    const { userIdToDeactivate } = deactivateUserInput

    const deactivatedUser = await this.transactionManager.execute(async () => {
      const deactivatedUser = await this.userRepository.deactivate(new UserId(userIdToDeactivate))
      deactivatedUser.deactivate()
      return deactivatedUser
    }, [this.userRepository])

    userDeactivated(this.userMapper.toDTO(deactivatedUser))
  }
}
