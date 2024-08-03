import { ProfileResponse } from '@hatsuportal/contracts'
import { ProfileDTO } from '@hatsuportal/user-management'
import { IProfileApiMapper } from '/application/dataAccess/http/mappers/IProfileApiMapper'

export class ProfileApiMapper implements IProfileApiMapper {
  toResponse(profile: ProfileDTO): ProfileResponse {
    return {
      storiesCreated: profile.storiesCreated
    }
  }
}
