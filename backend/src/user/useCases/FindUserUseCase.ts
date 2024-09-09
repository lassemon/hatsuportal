import { IFindUserUseCase, IFindUserUseCaseOptions, InsertUserQueryDTO, UpdateUserQueryDTO } from '@hatsuportal/application'
import { ApiError, UserDTO, IUserRepository } from '@hatsuportal/domain'

export class FindUserUseCase implements IFindUserUseCase {
  constructor(private readonly userRepository: IUserRepository<InsertUserQueryDTO, UpdateUserQueryDTO>) {}

  async execute({ user: loggedInUser }: IFindUserUseCaseOptions): Promise<UserDTO> {
    const user = await this.userRepository.findById(loggedInUser.id)
    if (!user || !user.active) {
      throw new ApiError(404, 'NotFound')
    }
    return user.serialize()
  }
}
