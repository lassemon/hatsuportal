import { AuthorizationError, IUseCase, IUseCaseOptions } from '@hatsuportal/foundation'
import { UserId } from '../../../../domain'
import { IUserRepository } from '../../../repositories/IUserRepository'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { UserDTO } from '../../../dtos'

export interface IGetAllUsersUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  allUsers: (users: UserDTO[]) => void
}

export type IGetAllUsersUseCase = IUseCase<IGetAllUsersUseCaseOptions>

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly userMapper: IUserApplicationMapper) {}

  async execute({ loggedInUserId, allUsers }: IGetAllUsersUseCaseOptions): Promise<void> {
    const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
    if (!loggedInUser?.isAdmin()) throw new AuthorizationError('You are not authorized to see all users.')

    const users = await this.userRepository.getAll()
    allUsers(users.map((user) => this.userMapper.toDTO(user)))
  }
}
