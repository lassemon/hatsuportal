import { IGetAllUsersUseCase, IGetAllUsersUseCaseOptions, InsertUserQueryDTO, UpdateUserQueryDTO } from '@hatsuportal/application'
import { ApiError, UserDTO, IUserRepository } from '@hatsuportal/domain'

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository<InsertUserQueryDTO, UpdateUserQueryDTO>) {}

  async execute({ user }: IGetAllUsersUseCaseOptions): Promise<UserDTO[]> {
    if (!user.isAdmin()) {
      throw new ApiError(403, 'Forbidden', `Access denied for roles '${user.roles}': Only admin users can retrieve the list of all users.`)
    }

    const users = await this.userRepository.getAll()
    return users.map((user) => user.serialize())
  }
}
