import { IUseCase, IUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { LoginUserInputDTO, UserDTO } from '../dtos'

export interface ILoginUserUseCaseOptions extends IUseCaseOptions {
  loginUserInput: LoginUserInputDTO
  loginSuccess: (authToken: string, refreshToken: string, user: UserDTO) => void
}

export type ILoginUserUseCase = IUseCase<ILoginUserUseCaseOptions>
