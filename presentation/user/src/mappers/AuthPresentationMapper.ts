import { LoginUserInputDTO } from '@hatsuportal/user-management'
import { LoginRequest } from '../api/requests/LoginRequest'
import { InvalidRequestError } from '@hatsuportal/presentation-common'

export interface IAuthPresentationMapper {
  toLoginUserInputDTO(loginRequest: LoginRequest): LoginUserInputDTO
}

export class AuthPresentationMapper implements IAuthPresentationMapper {
  toLoginUserInputDTO(loginRequest: LoginRequest): LoginUserInputDTO {
    if (!loginRequest.username) {
      throw new InvalidRequestError('Missing required post parameter "username"')
    }
    if (!loginRequest.password) {
      throw new InvalidRequestError('Missing required post parameter "password"')
    }

    return {
      username: loginRequest.username,
      password: loginRequest.password
    }
  }
}
