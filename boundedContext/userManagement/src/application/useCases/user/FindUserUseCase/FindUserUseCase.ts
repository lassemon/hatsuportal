import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { UserId } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { FindUserInputDTO } from '../../../dtos'
import { UserDTO } from '../../../dtos'

export interface IFindUserUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  findUserInput: FindUserInputDTO
  userFound: (user: UserDTO) => void
}

export type IFindUserUseCase = IUseCase<IFindUserUseCaseOptions>

export class FindUserUseCase implements IFindUserUseCase {
  constructor(
    private readonly userRepository: IUserReadRepository,
    private readonly userMapper: IUserApplicationMapper
  ) {}

  async execute({ findUserInput, userFound }: IFindUserUseCaseOptions): Promise<void> {
    const { userIdToFind } = findUserInput

    const foundUser = await this.userRepository.findById(new UserId(userIdToFind))

    if (!foundUser) {
      throw new NotFoundError(`User with id ${userIdToFind} not found`)
    }
    userFound(this.userMapper.fromReadModel(foundUser))
  }
}
