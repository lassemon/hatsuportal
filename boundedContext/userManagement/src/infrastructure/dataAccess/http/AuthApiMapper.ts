import { LoginRequest } from '@hatsuportal/contracts'
import { InvalidRequestError } from '@hatsuportal/platform'
import { IAuthApiMapper } from '../../../application/dataAccess/http/IAuthApiMapper'
import { LoginUserInputDTO } from '../../../application/dtos/LoginUserInputDTO'

export class AuthApiMapper implements IAuthApiMapper {
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
