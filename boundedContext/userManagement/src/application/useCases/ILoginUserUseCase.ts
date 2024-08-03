import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { UserDTO } from '../dtos/UserDTO'
import { LoginUserInputDTO } from '../dtos/LoginUserInputDTO'

export interface ILoginUserUseCaseOptions extends IUseCaseOptions {
  loginUserInput: LoginUserInputDTO
  loginSuccess: (authToken: string, refreshToken: string, user: UserDTO) => void
}

export type ILoginUserUseCase = IUseCase<ILoginUserUseCaseOptions>
