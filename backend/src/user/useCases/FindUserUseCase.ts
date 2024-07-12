import { InsertUserQueryDTO, UpdateUserQueryDTO, UseCaseInterface, UseCaseOptionsInterface } from '@hatsuportal/application'
import { ApiError, User, UserDTO, UserRepositoryInterface } from '@hatsuportal/domain'

export interface FindUserUseCaseOptions extends UseCaseOptionsInterface {
  user: User
}

export type FindUserUseCaseInterface = UseCaseInterface<FindUserUseCaseOptions, UserDTO>

export class FindUserUseCase implements FindUserUseCaseInterface {
  constructor(private readonly userRepository: UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO>) {}

  async execute({ user: loggedInUser }: FindUserUseCaseOptions): Promise<UserDTO> {
    const user = await this.userRepository.findById(loggedInUser.id)
    if (!user || !user.active) {
      throw new ApiError(404, 'NotFound')
    }
    return user.serialize()
  }
}
