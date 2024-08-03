import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ITransactionAware, ITransactionManager } from '@hatsuportal/platform'
import { UserId, IUserRepository, User, UserName, Email, UserRole } from '../../../../domain'
import { CreateUserInputDTO, UserDTO } from '../../../dtos'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'
import { castToEnum, unixtimeNow, UserRoleEnum, uuid } from '@hatsuportal/common'
import { isEmpty, uniq } from 'lodash'

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
      const now = unixtimeNow()
      const user = User.create({
        id: new UserId(uuid()),
        name: new UserName(createUserInput.name.trim()),
        email: new Email(createUserInput.email.trim()),
        active: true,
        roles: isEmpty(createUserInput.roles)
          ? [new UserRole(UserRoleEnum.Viewer)]
          : uniq(createUserInput.roles.map((role) => new UserRole(castToEnum(role, UserRoleEnum, UserRoleEnum.Viewer)))),
        createdAt: new UnixTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      })
      await this.userRepository.insert(user, this.passwordFactory.create(password))
      return [user]
    }, [this.userRepository])
    userCreated(this.userMapper.toDTO(savedUser))
  }
}
