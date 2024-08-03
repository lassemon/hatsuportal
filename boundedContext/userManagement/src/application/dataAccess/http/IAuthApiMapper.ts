import { LoginUserInputDTO } from '../../dtos/LoginUserInputDTO'
import { LoginRequest } from '@hatsuportal/contracts'

export interface IAuthApiMapper {
  toLoginUserInputDTO(loginRequest: LoginRequest): LoginUserInputDTO
}
