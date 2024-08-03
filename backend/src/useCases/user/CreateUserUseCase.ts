import {
  ApplicationError,
  AuthorizationError,
  ForbiddenError,
  ICreateUserUseCase,
  ICreateUserUseCaseOptions,
  IUserApplicationMapper
} from '@hatsuportal/application'
import { unixtimeNow, UserRoleEnum, uuid } from '@hatsuportal/common'
import { IUserRepository, Password, User, UserId } from '@hatsuportal/domain'
import _ from 'lodash'

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ createUserInput, foundUser }: ICreateUserUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, creationData } = createUserInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser?.isAdmin()) throw new AuthorizationError('You are not authorized to create a user')

      const user = new User({
        id: uuid(),
        name: creationData.username,
        email: creationData.email,
        active: true,
        roles: _.isEmpty(creationData.roles) ? [UserRoleEnum.Viewer] : creationData.roles,
        createdAt: unixtimeNow(),
        updatedAt: null
      })
      await this.ensureUniqueId(user.id)
      const createdUser = await this.userRepository.insert(user, new Password(creationData.password))
      foundUser(this.userMapper.toDTO(createdUser))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }

  private async ensureUniqueId(id: UserId): Promise<void> {
    const previousImage = await this.userRepository.findById(id)
    if (previousImage) {
      throw new ForbiddenError(`Cannot create user with id ${id} because it already exists.`)
    }
  }
}
