import {
  ICreateUserUseCase,
  ICreateUserUseCaseOptions,
  IUserApplicationMapper,
  IUserFactory,
  IUserRepository,
  Password,
  User
} from '@hatsuportal/user-management'
import { Logger, unixtimeNow, UserRoleEnum, uuid } from '@hatsuportal/common'
import { ApplicationError, IDomainEventDispatcher } from '@hatsuportal/common-bounded-context'
import isEmpty from 'lodash/isEmpty'

const logger = new Logger('CreateUserUseCase')

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly userFactory: IUserFactory
  ) {}

  async execute({ createUserInput, foundUser }: ICreateUserUseCaseOptions): Promise<void> {
    try {
      const { creationData } = createUserInput

      const now = unixtimeNow()
      const result = this.userFactory.createUser({
        id: uuid(),
        name: creationData.name,
        email: creationData.email,
        active: true,
        roles: isEmpty(creationData.roles) ? [UserRoleEnum.Viewer] : creationData.roles,
        createdAt: now,
        updatedAt: now
      })

      if (result.isFailure()) {
        throw result.error
      }

      const createdUser = await this.userRepository.insert(result.value, new Password(creationData.password))
      foundUser(this.userMapper.toDTO(await this.dispatchEvents(createdUser)))
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
