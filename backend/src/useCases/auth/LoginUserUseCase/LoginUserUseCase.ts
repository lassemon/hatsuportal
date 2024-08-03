import {
  Encryption,
  ILoginUserUseCase,
  ILoginUserUseCaseOptions,
  IUserApplicationMapper,
  IUserRepository,
  UserName
} from '@hatsuportal/user-management'
import { Authorization } from '/infrastructure'
import { AuthenticationError } from '@hatsuportal/common-bounded-context'

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly userApplicationMapper: IUserApplicationMapper,
    private userRepository: IUserRepository,
    private readonly authorization: Authorization
  ) {}

  async execute({ loginUserInput, loginSuccess }: ILoginUserUseCaseOptions) {
    const { username, password } = loginUserInput
    const userCredentials = await this.userRepository.getUserCredentialsByUsername(new UserName(username))
    const user = await this.userRepository.findByName(new UserName(username))

    if (!userCredentials || !user || !(await Encryption.compare(password, userCredentials.passwordHash)) || !user.active) {
      throw new AuthenticationError('Incorrect username or password')
    } else {
      const authToken = this.authorization.createAuthToken(user)
      const refreshToken = this.authorization.createRefreshToken(user)

      loginSuccess(authToken, refreshToken, this.userApplicationMapper.toDTO(user))
    }
  }
}
