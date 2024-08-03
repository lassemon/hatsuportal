import { LoginUserInputDTO } from '@hatsuportal/application/lib/dtos/LoginUserInputDTO'
import { LoginRequest } from '../api/requests/LoginRequest'
import { InvalidRequestError } from '../errors/InvalidRequestError'

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
