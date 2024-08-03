import { IUnitOfWork, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { DeactivateUserInputDTO, UserDTO } from '../../../dtos'
import { User, UserId, IUserWriteRepository } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserLookupService } from '../../../services/UserLookupService'

export interface IDeactivateUserUseCaseOptions extends IUseCaseOptions {
  deactivatingUserId: string
  deactivateUserInput: DeactivateUserInputDTO
  userDeactivated: (user: UserDTO) => void
}

export type IDeactivateUserUseCase = IUseCase<IDeactivateUserUseCaseOptions>

export class DeactivateUserUseCase implements IDeactivateUserUseCase {
  constructor(
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly userLookupService: IUserLookupService,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute({ deactivatingUserId, deactivateUserInput, userDeactivated }: IDeactivateUserUseCaseOptions): Promise<void> {
    const { userIdToDeactivate } = deactivateUserInput

    const [deactivatedUser] = await this.unitOfWork.execute<[User]>(async () => {
      const userToDeactivate = await this.userWriteRepository.findByIdForUpdate(new UserId(userIdToDeactivate))
      if (!userToDeactivate) {
        throw new NotFoundError(`User deactivation failed because user '${userIdToDeactivate}' could not be found from the database.`)
      }
      // domain rule treats inactive users a closed for modification, not set in stone, but if
      // this needs to change, also consider UpdateUserUseCase that adheres to the same rule.
      if (!userToDeactivate.active) {
        throw new NotFoundError(`User deactivation failed because user '${userIdToDeactivate}' could not be found from the database.`)
      }
      userToDeactivate.deactivate(new UserId(deactivatingUserId))
      await this.userWriteRepository.deactivate(userToDeactivate)
      return [userToDeactivate]
    })

    this.userLookupService.invalidateById(deactivatedUser.id)
    userDeactivated(this.userApplicationMapper.toDTO(deactivatedUser))
  }
}
