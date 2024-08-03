import { IRefreshTokenUseCase, IRefreshTokenUseCaseOptions, IUserRepository, UserId } from '@hatsuportal/user-management'
import { Authorization } from '/infrastructure'
import { Logger } from '@hatsuportal/common'
import { AuthenticationError } from '@hatsuportal/common-bounded-context'

const logger = new Logger('RefreshTokenUseCase')

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly authorization: Authorization) {}

  async execute({ refreshToken, tokenRefreshed }: IRefreshTokenUseCaseOptions) {
    try {
      const decodedRefreshToken = this.authorization.verifyRefreshToken(refreshToken)

      const user = await this.userRepository.findById(new UserId(decodedRefreshToken.userId))
      if (!user || !user.active) {
        throw new AuthenticationError('Unauthorized')
      }
      const newAuthToken = this.authorization.createAuthToken(user)

      tokenRefreshed(newAuthToken)
    } catch (error) {
      logger.debug('REFRESH TOKEN EXPIRED')
      throw new AuthenticationError('Unauthorized')
    }
  }
}
