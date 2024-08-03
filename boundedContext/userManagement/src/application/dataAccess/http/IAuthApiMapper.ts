import { LoginUserInputDTO } from '../../dtos/useCase/LoginUserInputDTO'
import { LoginRequest } from '@hatsuportal/contracts'

export interface IAuthApiMapper {
  toLoginUserInputDTO(loginRequest: LoginRequest): LoginUserInputDTO
}
