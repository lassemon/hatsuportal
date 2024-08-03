import { IRefreshTokenUseCase, IRefreshTokenUseCaseOptions, IUserRepository, UserId } from '@hatsuportal/user-management'
import { Authorization } from '/infrastructure'
import { AuthenticationError } from '@hatsuportal/common-bounded-context'

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly authorization: Authorization) {}

  async execute({ refreshToken, tokenRefreshed }: IRefreshTokenUseCaseOptions) {
    const decodedRefreshToken = this.authorization.verifyRefreshToken(refreshToken)

    const user = await this.userRepository.findById(new UserId(decodedRefreshToken.userId))
    if (!user || !user.active) {
      throw new AuthenticationError('Unauthorized')
    }
    const newAuthToken = this.authorization.createAuthToken(user)

    tokenRefreshed(newAuthToken)
  }
}
