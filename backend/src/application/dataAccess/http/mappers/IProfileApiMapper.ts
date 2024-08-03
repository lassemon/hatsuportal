import { ProfileDTO } from '@hatsuportal/user-management'
import { ProfileResponse } from '@hatsuportal/contracts'

export interface IProfileApiMapper {
  toResponse(profile: ProfileDTO): ProfileResponse
}
