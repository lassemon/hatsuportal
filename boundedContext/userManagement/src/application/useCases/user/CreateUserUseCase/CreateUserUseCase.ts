import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ITransactionAware, ITransactionManager } from '@hatsuportal/platform'
import { UserId, IUserRepository } from '../../../../domain'
import { CreateUserInputDTO, UserDTO } from '../../../dtos'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'

export interface ICreateUserUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createUserInput: CreateUserInputDTO
  userCreated: (user: UserDTO) => void
}

export type ICreateUserUseCase = IUseCase<ICreateUserUseCaseOptions>

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository & ITransactionAware,
    private readonly userMapper: IUserApplicationMapper,
    private readonly transactionManager: ITransactionManager<UserId, UnixTimestamp>,
    private readonly passwordFactory: IPasswordFactory
  ) {}

  async execute({ createUserInput, userCreated }: ICreateUserUseCaseOptions): Promise<void> {
    const { password } = createUserInput

    const [savedUser] = await this.transactionManager.execute(async () => {
      const user = this.userMapper.createInputToDomainEntity(createUserInput)
      return [await this.userRepository.insert(user, this.passwordFactory.create(password))]
    }, [this.userRepository])
    userCreated(this.userMapper.toDTO(savedUser))
  }
}
