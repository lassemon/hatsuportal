import {
  InsertUserQueryDTO,
  UpdateUserQueryDTO,
  IUserMapper,
  ICreateUserUseCase,
  ICreateUserUseCaseOptions
} from '@hatsuportal/application'
import { UserDTO, IUserRepository } from '@hatsuportal/domain'

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository<InsertUserQueryDTO, UpdateUserQueryDTO>,
    private readonly userMapper: IUserMapper
  ) {}

  async execute({ createUserRequest }: ICreateUserUseCaseOptions): Promise<UserDTO> {
    const user = this.userMapper.createRequestToUser(createUserRequest)
    const insertQuery = await this.userMapper.toInsertQuery(user.serialize(), createUserRequest.password)
    const createdUser = await this.userRepository.insert(insertQuery)
    return createdUser.serialize()
  }
}
