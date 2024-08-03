import { LoginRequest } from '@hatsuportal/contracts'
import { LoginUserInputDTO } from '@hatsuportal/user-management'

export interface IAuthApiMapper {
  toLoginUserInputDTO(loginRequest: LoginRequest): LoginUserInputDTO
}
