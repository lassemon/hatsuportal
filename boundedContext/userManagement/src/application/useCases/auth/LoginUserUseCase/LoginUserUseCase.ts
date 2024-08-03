import { ITokenService } from '../../../services/ITokenService'
import { AuthenticationError, IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { LoginUserInputDTO, UserDTO } from '../../../dtos'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { Encryption } from '../../../auth/Encryption'
import { IUserRepository, UserName } from '../../../../domain'

export interface ILoginUserUseCaseOptions extends IUseCaseOptions {
  loginUserInput: LoginUserInputDTO
  loginSuccess: (authToken: string, refreshToken: string, user: UserDTO) => void
}

export type ILoginUserUseCase = IUseCase<ILoginUserUseCaseOptions>

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly userApplicationMapper: IUserApplicationMapper,
    private userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute({ loginUserInput, loginSuccess }: ILoginUserUseCaseOptions) {
    const { username, password } = loginUserInput
    const userCredentials = await this.userRepository.getUserCredentialsByUsername(new UserName(username))
    const user = await this.userRepository.findByName(new UserName(username))

    if (!userCredentials || !user || !(await Encryption.compare(password, userCredentials.passwordHash)) || !user.active) {
      throw new AuthenticationError('Incorrect username or password')
    } else {
      const authToken = this.tokenService.createAuthToken(user)
      const refreshToken = this.tokenService.createRefreshToken(user)

      loginSuccess(authToken, refreshToken, this.userApplicationMapper.toDTO(user))
    }
  }
}
