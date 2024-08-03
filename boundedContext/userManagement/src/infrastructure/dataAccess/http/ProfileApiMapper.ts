import { ProfileResponse } from '@hatsuportal/contracts'
import { ProfileDTO } from '../../../application/dtos'
import { IProfileApiMapper } from '../../../application/dataAccess/http/IProfileApiMapper'

export class ProfileApiMapper implements IProfileApiMapper {
  toResponse(profile: ProfileDTO): ProfileResponse {
    return {
      storiesCreated: profile.storiesCreated
    }
  }
}
