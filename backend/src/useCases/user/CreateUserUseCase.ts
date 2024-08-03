import {
  ICreateUserUseCase,
  ICreateUserUseCaseOptions,
  IUserApplicationMapper,
  IUserRepository,
  Password,
  User,
  UserId
} from '@hatsuportal/user-management'
import { unixtimeNow, UserRoleEnum, uuid } from '@hatsuportal/common'
import { AuthorizationError, ApplicationError } from '@hatsuportal/common-bounded-context'
import _ from 'lodash'

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ createUserInput, foundUser }: ICreateUserUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, creationData } = createUserInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser?.isAdmin()) throw new AuthorizationError('You are not authorized to create a user')

      const now = unixtimeNow()
      const user = new User({
        id: uuid(),
        name: creationData.name,
        email: creationData.email,
        active: true,
        roles: _.isEmpty(creationData.roles) ? [UserRoleEnum.Viewer] : creationData.roles,
        createdAt: now,
        updatedAt: now
      })
      const createdUser = await this.userRepository.insert(user, new Password(creationData.password))
      foundUser(this.userMapper.toDTO(createdUser))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
