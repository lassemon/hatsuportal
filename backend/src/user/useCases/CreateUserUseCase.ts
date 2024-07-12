import {
  CreateUserRequestDTO,
  InsertUserQueryDTO,
  UpdateUserQueryDTO,
  UseCaseInterface,
  UseCaseOptionsInterface,
  UserMapperInterface
} from '@hatsuportal/application'
import { UserDTO, UserRepositoryInterface } from '@hatsuportal/domain'

export interface CreateUserUseCaseOptions extends UseCaseOptionsInterface {
  createUserRequest: CreateUserRequestDTO
}

export type CreateUserUseCaseInterface = UseCaseInterface<CreateUserUseCaseOptions, UserDTO>

export class CreateUserUseCase implements CreateUserUseCaseInterface {
  constructor(
    private readonly userRepository: UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO>,
    private readonly userMapper: UserMapperInterface
  ) {}

  async execute({ createUserRequest }: CreateUserUseCaseOptions): Promise<UserDTO> {
    const user = this.userMapper.createRequestToUser(createUserRequest)
    const insertQuery = await this.userMapper.toInsertQuery(user.serialize(), createUserRequest.password)
    const createdUser = await this.userRepository.insert(insertQuery)
    return createdUser.serialize()
  }
}
