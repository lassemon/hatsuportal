import { ITransactionManager, IUseCase, IUseCaseOptions } from '@hatsuportal/foundation'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Password, UserId } from '../../../../domain'
import { CreateUserInputDTO, UserDTO } from '../../../dtos'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserRepository } from '../../../repositories/IUserRepository'

export interface ICreateUserUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createUserInput: CreateUserInputDTO
  userCreated: (user: UserDTO) => void
}

export type ICreateUserUseCase = IUseCase<ICreateUserUseCaseOptions>

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly transactionManager: ITransactionManager<UserId, UnixTimestamp>
  ) {}

  async execute({ createUserInput, userCreated }: ICreateUserUseCaseOptions): Promise<void> {
    const { password } = createUserInput

    const [savedUser] = await this.transactionManager.execute(async () => {
      const user = this.userMapper.createInputToDomainEntity(createUserInput)
      return [await this.userRepository.insert(user, new Password(password))]
    }, [this.userRepository])
    userCreated(this.userMapper.toDTO(savedUser))
  }
}
