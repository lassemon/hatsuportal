import { InsertUserQueryDTO, UpdateUserQueryDTO, UseCaseInterface, UseCaseOptionsInterface } from '@hatsuportal/application'
import { ApiError, User, UserDTO, UserRepositoryInterface } from '@hatsuportal/domain'

export interface GetAllUsersUseCaseOptions extends UseCaseOptionsInterface {
  user: User
}

export type GetAllUsersUseCaseInterface = UseCaseInterface<GetAllUsersUseCaseOptions, UserDTO[]>

export class GetAllUsersUseCase implements GetAllUsersUseCaseInterface {
  constructor(private readonly userRepository: UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO>) {}

  async execute({ user }: GetAllUsersUseCaseOptions): Promise<UserDTO[]> {
    if (!user.isAdmin()) {
      throw new ApiError(403, 'Forbidden', `Access denied for roles '${user.roles}': Only admin users can retrieve the list of all users.`)
    }

    const users = await this.userRepository.getAll()
    return users.map((user) => user.serialize())
  }
}
