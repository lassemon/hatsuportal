import {
  ApplicationError,
  AuthenticationError,
  Encryption,
  ILoginUserUseCase,
  ILoginUserUseCaseOptions,
  IUserApplicationMapper
} from '@hatsuportal/application'
import { IUserRepository, UserName } from '@hatsuportal/domain'
import { Authorization } from 'infrastructure'

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly userApplicationMapper: IUserApplicationMapper,
    private userRepository: IUserRepository,
    private readonly authorization: Authorization
  ) {}

  async execute({ loginUserInput, loginSuccess }: ILoginUserUseCaseOptions) {
    const { username, password } = loginUserInput
    try {
      const userCredentials = await this.userRepository.getUserCredentialsByUsername(new UserName(username))
      const user = await this.userRepository.findByName(new UserName(username))

      if (!userCredentials || !user || !(await Encryption.compare(password, userCredentials.passwordHash)) || !user.active) {
        throw new AuthenticationError('Incorrect username or password')
      } else {
        const authToken = this.authorization.createAuthToken(user)
        const refreshToken = this.authorization.createRefreshToken(user)

        loginSuccess(authToken, refreshToken, this.userApplicationMapper.toDTO(user))
      }
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
