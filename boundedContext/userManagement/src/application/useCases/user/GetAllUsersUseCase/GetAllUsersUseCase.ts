import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { UserDTO } from '../../../dtos'

export interface IGetAllUsersUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  allUsers: (users: UserDTO[]) => void
}

export type IGetAllUsersUseCase = IUseCase<IGetAllUsersUseCaseOptions>

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(
    private readonly userRepository: IUserReadRepository,
    private readonly userMapper: IUserApplicationMapper
  ) {}

  async execute({ allUsers }: IGetAllUsersUseCaseOptions): Promise<void> {
    const users = await this.userRepository.findAll()
    allUsers(users.map((user) => this.userMapper.fromReadModel(user)))
  }
}
