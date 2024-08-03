import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IRefreshTokenUseCaseOptions extends IUseCaseOptions {
  refreshToken: string
  tokenRefreshed: (newAuthToken: string) => void
}

export type IRefreshTokenUseCase = IUseCase<IRefreshTokenUseCaseOptions>
