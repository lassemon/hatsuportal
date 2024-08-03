import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'

export interface IRefreshTokenUseCaseOptions extends IUseCaseOptions {
  refreshToken: string
  tokenRefreshed: (newAuthToken: string) => void
}

export type IRefreshTokenUseCase = IUseCase<IRefreshTokenUseCaseOptions>
