import { IUseCase, IUseCaseOptions } from './IUseCase'
import { UserDTO } from '../dtos/UserDTO'
import { LoginUserInputDTO } from '../dtos/LoginUserInputDTO'

export interface ILoginUserUseCaseOptions extends IUseCaseOptions {
  loginUserInput: LoginUserInputDTO
  loginSuccess: (authToken: string, refreshToken: string, user: UserDTO) => void
}

export type ILoginUserUseCase = IUseCase<ILoginUserUseCaseOptions>
