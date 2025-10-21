import { ITransactionManager, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/foundation'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DeactivateUserInputDTO, UserDTO } from '../../../dtos'
import { UserId } from '../../../../domain'
import { IUserRepository } from '../../../repositories/IUserRepository'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  deactivatingUserId: string
  deactivateUserInput: DeactivateUserInputDTO
  userDeactivated: (user: UserDTO) => void
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions>

export class DeactivateUserUseCase implements IDeactivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly transactionManager: ITransactionManager<UserId, UnixTimestamp>
  ) {}

  async execute({ deactivateUserInput, userDeactivated }: IDeactivateUserUseCaseOptions): Promise<void> {
    const { userIdToDeactivate } = deactivateUserInput

    const [deactivatedUser] = await this.transactionManager.execute(async () => {
      const userToDeactivate = await this.userRepository.findById(new UserId(userIdToDeactivate))
      if (!userToDeactivate) {
        throw new NotFoundError(`User deactivation failed because user '${userIdToDeactivate}' could not be found from the database.`)
      }
      userToDeactivate.deactivate()
      await this.userRepository.deactivate(userToDeactivate)
      return [userToDeactivate]
    }, [this.userRepository])

    userDeactivated(this.userMapper.toDTO(deactivatedUser))
  }
}
