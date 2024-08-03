import { ProfileResponse, UpdateProfileRequest } from '@hatsuportal/contracts'
import { ProfileDTO, UpdateUserProfileImageInputDTO, UpdateUserProfileInputDTO } from '../../../application/dtos'
import { IProfileApiMapper } from '../../../application/dataAccess/http/IProfileApiMapper'
import { Maybe } from '@hatsuportal/common'

export class ProfileApiMapper implements IProfileApiMapper {
  toResponse(profile: ProfileDTO): ProfileResponse {
    return {
      bio: profile.bio,
      statusMessage: profile.statusMessage,
      profileImageId: profile.profileImageId
    }
  }

  toUpdateUserProfileInputDTO(updateProfileRequest: UpdateProfileRequest): UpdateUserProfileInputDTO {
    const updateUserProfileData: UpdateUserProfileInputDTO = {
      bio: updateProfileRequest.bio,
      statusMessage: updateProfileRequest.statusMessage
    }

    let updateUserProfileImageData: Maybe<UpdateUserProfileImageInputDTO> = undefined

    if (updateProfileRequest.image === null) {
      updateUserProfileImageData = null
    }

    if (updateProfileRequest.image !== undefined && updateProfileRequest.image !== null) {
      updateUserProfileImageData = {
        mimeType: updateProfileRequest.image.mimeType,
        size: updateProfileRequest.image.size,
        base64: updateProfileRequest.image.base64
      }
    }

    return {
      ...updateUserProfileData,
      ...(updateUserProfileImageData !== undefined ? { image: updateUserProfileImageData } : {})
    }
  }
}
