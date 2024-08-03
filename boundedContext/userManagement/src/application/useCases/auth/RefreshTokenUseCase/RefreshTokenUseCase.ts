import { UserId } from '../../../../domain'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { ITokenService } from '../../../services/ITokenService'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { AuthenticationError, IUseCase, IUseCaseOptions } from '@hatsuportal/platform'

export interface IRefreshTokenUseCaseOptions extends IUseCaseOptions {
  refreshToken: string
  tokenRefreshed: (newAuthToken: string) => void
}

export type IRefreshTokenUseCase = IUseCase<IRefreshTokenUseCaseOptions>

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private readonly userReadRepository: IUserReadRepository,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly tokenService: ITokenService
  ) {}

  async execute({ refreshToken, tokenRefreshed }: IRefreshTokenUseCaseOptions) {
    const decodedRefreshToken = this.tokenService.verifyRefreshToken(refreshToken)

    const userReadModel = await this.userReadRepository.findById(new UserId(decodedRefreshToken.userId))
    if (!userReadModel || !userReadModel.active) {
      throw new AuthenticationError('Unauthorized')
    }
    const newAuthToken = this.tokenService.createAuthToken(this.userApplicationMapper.fromReadModel(userReadModel))

    tokenRefreshed(newAuthToken)
  }
}
