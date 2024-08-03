import { UserId, IUserRepository } from '../../../../domain'
import { ITokenService } from '../../../services/ITokenService'
import { AuthenticationError, IUseCase, IUseCaseOptions } from '@hatsuportal/platform'

export interface IRefreshTokenUseCaseOptions extends IUseCaseOptions {
  refreshToken: string
  tokenRefreshed: (newAuthToken: string) => void
}

export type IRefreshTokenUseCase = IUseCase<IRefreshTokenUseCaseOptions>

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly tokenService: ITokenService) {}

  async execute({ refreshToken, tokenRefreshed }: IRefreshTokenUseCaseOptions) {
    const decodedRefreshToken = this.tokenService.verifyRefreshToken(refreshToken)

    const user = await this.userRepository.findById(new UserId(decodedRefreshToken.userId))
    if (!user || !user.active) {
      throw new AuthenticationError('Unauthorized')
    }
    const newAuthToken = this.tokenService.createAuthToken(user)

    tokenRefreshed(newAuthToken)
  }
}
