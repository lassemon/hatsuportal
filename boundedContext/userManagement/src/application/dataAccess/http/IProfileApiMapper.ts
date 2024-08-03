import { ProfileResponse, UpdateProfileRequest } from '@hatsuportal/contracts'
import { ProfileDTO, UpdateUserProfileInputDTO } from '../../dtos'

export interface IProfileApiMapper {
  toResponse(profile: ProfileDTO): ProfileResponse
  toUpdateUserProfileInputDTO(updateProfileRequest: UpdateProfileRequest): UpdateUserProfileInputDTO
}
