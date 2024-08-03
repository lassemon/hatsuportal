import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { IUserRepository } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { UserDTO } from '../../../dtos'

export interface IGetAllUsersUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  allUsers: (users: UserDTO[]) => void
}

export type IGetAllUsersUseCase = IUseCase<IGetAllUsersUseCaseOptions>

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ allUsers }: IGetAllUsersUseCaseOptions): Promise<void> {
    const users = await this.userRepository.getAll()
    allUsers(users.map((user) => this.userMapper.toDTO(user)))
  }
}
