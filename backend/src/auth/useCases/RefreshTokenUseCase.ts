import { AuthenticationError, IRefreshTokenUseCase, IRefreshTokenUseCaseOptions, NotFoundError } from '@hatsuportal/application'
import Authorization from '../Authorization'
import { IUserRepository, UserId } from '@hatsuportal/domain'
import { dateStringFromUnixTime, Logger } from '@hatsuportal/common'

const logger = new Logger('RefreshTokenUseCase')

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository, private readonly authorization: Authorization) {}

  async execute({ refreshToken, tokenRefreshed }: IRefreshTokenUseCaseOptions) {
    const decodedRefreshToken = this.authorization.decodeToken(refreshToken)

    if (!this.authorization.validateToken(decodedRefreshToken)) {
      logger.debug('REFRESH TOKEN EXPIRED ' + dateStringFromUnixTime(decodedRefreshToken.exp))
      throw new AuthenticationError('Unauthorized')
    } else {
      const user = await this.userRepository.findById(new UserId(decodedRefreshToken.userId))
      if (!user || !user.active) {
        throw new NotFoundError('NotFound')
      }
      const newAuthToken = this.authorization.createAuthToken(user)

      tokenRefreshed(newAuthToken)
    }
  }
}
