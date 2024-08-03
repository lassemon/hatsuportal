import { ProfileDTO } from '@hatsuportal/application'
import { ProfileResponse } from '../api/responses/ProfileResponse'
import { ProfilePresentation } from '../entities/ProfilePresentation'

export interface IProfilePresentationMapper {
  toResponse(profile: ProfileDTO): ProfileResponse
  toProfilePresentation(response: ProfileResponse): ProfilePresentation
}

export class ProfilePresentationMapper implements IProfilePresentationMapper {
  toResponse(profile: ProfileDTO): ProfileResponse {
    return {
      storiesCreated: profile.storiesCreated
    }
  }

  toProfilePresentation(response: ProfileResponse): ProfilePresentation {
    return new ProfilePresentation(response)
  }
}
