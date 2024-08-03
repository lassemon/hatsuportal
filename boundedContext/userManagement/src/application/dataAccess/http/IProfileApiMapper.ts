import { ProfileResponse } from '@hatsuportal/contracts'
import { ProfileDTO } from '../../dtos'

export interface IProfileApiMapper {
  toResponse(profile: ProfileDTO): ProfileResponse
}
