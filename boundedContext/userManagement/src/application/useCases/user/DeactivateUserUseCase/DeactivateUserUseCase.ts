import { IDomainEventService, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { ITransactionAware } from '@hatsuportal/platform'
import { DeactivateUserInputDTO, UserDTO } from '../../../dtos'
import { UserId, IUserRepository } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  deactivatingUserId: string
  deactivateUserInput: DeactivateUserInputDTO
  userDeactivated: (user: UserDTO) => void
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions>

export class DeactivateUserUseCase implements IDeactivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository & ITransactionAware,
    private readonly userMapper: IUserApplicationMapper,
    private readonly domainEventService: IDomainEventService
  ) {}

  async execute({ deactivatingUserId, deactivateUserInput, userDeactivated }: IDeactivateUserUseCaseOptions): Promise<void> {
    const { userIdToDeactivate } = deactivateUserInput

    const userToDeactivate = await this.userRepository.findById(new UserId(userIdToDeactivate))
    if (!userToDeactivate) {
      throw new NotFoundError(`User deactivation failed because user '${userIdToDeactivate}' could not be found from the database.`)
    }
    userToDeactivate.deactivate(new UserId(deactivatingUserId))
    await this.userRepository.deactivate(userToDeactivate)

    await this.domainEventService.persistToOutbox(userToDeactivate.domainEvents)

    userDeactivated(this.userMapper.toDTO(userToDeactivate))
  }
}
