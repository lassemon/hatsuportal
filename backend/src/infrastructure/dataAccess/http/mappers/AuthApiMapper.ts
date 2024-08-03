import { LoginRequest } from '@hatsuportal/contracts'
import { LoginUserInputDTO } from '@hatsuportal/user-management'
import { InvalidRequestError } from '../../../../infrastructure/errors/InvalidRequestError'
import { IAuthApiMapper } from '../../../../application/dataAccess'

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
