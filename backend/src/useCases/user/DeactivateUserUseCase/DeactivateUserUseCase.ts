import { Logger } from '@hatsuportal/common'
import { AuthorizationError, ApplicationError, IDomainEventDispatcher } from '@hatsuportal/common-bounded-context'
import {
  IDeactivateUserUseCase,
  IDeactivateUserUseCaseOptions,
  IUserApplicationMapper,
  IUserRepository,
  User,
  UserId
} from '@hatsuportal/user-management'

const logger = new Logger('DeactivateUserUseCase')

export class DeactivateUserUseCase implements IDeactivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly eventDispatcher: IDomainEventDispatcher
  ) {}

  async execute({ deactivateUserInput, userDeactivated }: IDeactivateUserUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, userIdToDeactivate } = deactivateUserInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin() || loggedInUser.id.value !== userIdToDeactivate) {
        throw new AuthorizationError(
          `Access denied for ${loggedInUser?.id} deactivating ${userIdToDeactivate}: Only admin users or the user themselves can deactivate a user.`
        )
      }

      const deactivatedUser = await this.userRepository.deactivate(new UserId(userIdToDeactivate))
      deactivatedUser.deactivate()
      await this.dispatchEvents(deactivatedUser)
      userDeactivated(this.userMapper.toDTO(await this.dispatchEvents(deactivatedUser)))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }

  private async dispatchEvents(user: User): Promise<User> {
    for (const event of user!.domainEvents) {
      logger.debug(`Dispatching event ${event.eventType} for ${user!.id.value}`)
      await this.eventDispatcher.dispatch(event)
    }
    user!.clearEvents()

    return user
  }
}
