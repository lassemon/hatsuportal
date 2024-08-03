import {
  ICreateUserUseCase,
  ICreateUserUseCaseOptions,
  IUserApplicationMapper,
  IUserRepository,
  Password
} from '@hatsuportal/user-management'
import { ITransactionManager } from '@hatsuportal/common-bounded-context'

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({ createUserInput, userCreated }: ICreateUserUseCaseOptions): Promise<void> {
    const { creationData } = createUserInput

    const savedUser = await this.transactionManager.execute(async () => {
      const user = this.userMapper.createInputToDomainEntity(createUserInput)
      return await this.userRepository.insert(user, new Password(creationData.password))
    }, [this.userRepository])
    userCreated(this.userMapper.toDTO(savedUser))
  }
}
