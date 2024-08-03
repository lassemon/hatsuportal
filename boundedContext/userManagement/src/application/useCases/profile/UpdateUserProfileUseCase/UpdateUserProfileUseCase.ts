import { ConcurrencyError, IUnitOfWork, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { isUndefined } from 'lodash'
import { ProfileDTO, UpdateUserProfileInputDTO } from '../../../dtos'
import { Bio, ProfileImageId, StatusMessage, User, UserId, IUserWriteRepository } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserLookupService } from '../../../services/UserLookupService'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'
import { IProfileImageCleanupService } from '../../../services/profile/ProfileImageCleanupService'

export interface IUpdateUserProfileUseCaseOptions extends IUseCaseOptions {
  updatedById: string
  userId: string
  updateUserProfileInput: UpdateUserProfileInputDTO
  userProfileUpdated: (profile: ProfileDTO) => void
  updateConflict: (error: ConcurrencyError<User>) => void
}

export type IUpdateUserProfileUseCase = IUseCase<IUpdateUserProfileUseCaseOptions>

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
  constructor(
    private readonly mediaGateway: IMediaGateway,
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly userLookupService: IUserLookupService,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly profileImageCleanupService: IProfileImageCleanupService,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute({ updatedById, userId, updateUserProfileInput, userProfileUpdated, updateConflict }: IUpdateUserProfileUseCaseOptions): Promise<void> {
    const userIdToUpdate = userId
    const updatedBy = new UserId(updatedById)
    const profileImageIdsToCleanup: string[] = []

    let preparedImage: mediaV1.PreparedStagedImageContract | null = null
    if (!isUndefined(updateUserProfileInput.image) && updateUserProfileInput.image !== null) {
      preparedImage = await this.mediaGateway.prepareStagedImageFile({
        role: ImageRoleEnum.ProfilePicture,
        mimeType: updateUserProfileInput.image.mimeType ?? '',
        size: updateUserProfileInput.image.size ?? 0,
        ownerEntityType: EntityTypeEnum.User,
        ownerEntityId: userIdToUpdate,
        base64: updateUserProfileInput.image.base64 ?? '',
        createdById: updatedBy.value
      })
    }

    try {
      const targetUser = await this.userWriteRepository.findById(new UserId(userIdToUpdate))
      if (!targetUser || !targetUser.active) {
        throw new NotFoundError(`Cannot update target user with id ${userIdToUpdate}, user not found`)
      }

      const [updatedUser] = await this.unitOfWork.execute<[User]>(async () => {
        if (preparedImage) {
          await this.mediaGateway.registerPreparedStagedImageFileRollbackCleanup(preparedImage)
        }

        const existingUser = await this.userWriteRepository.findByIdForUpdate(new UserId(userIdToUpdate))
        if (!existingUser || !existingUser.active) {
          throw new NotFoundError(`User with id ${userIdToUpdate} not found`)
        }

        const user = existingUser.clone()
        const { bio, statusMessage } = updateUserProfileInput

        if (!isUndefined(bio)) user.updateBio(new Bio(bio), updatedBy)
        if (!isUndefined(statusMessage)) user.updateStatusMessage(new StatusMessage(statusMessage), updatedBy)

        if (!isUndefined(updateUserProfileInput.image)) {
          const existingProfileImageId = user.profile.profileImageId

          if (updateUserProfileInput.image === null) {
            if (!existingProfileImageId.equals(ProfileImageId.NOT_SET)) {
              profileImageIdsToCleanup.push(existingProfileImageId.value)
            }
            user.setProfileImage(ProfileImageId.NOT_SET, updatedBy)
          } else if (preparedImage) {
            const newProfileImageId = new ProfileImageId(preparedImage.imageId)
            const replacingProfileImage =
              !existingProfileImageId.equals(ProfileImageId.NOT_SET) && !existingProfileImageId.equals(newProfileImageId)
            if (replacingProfileImage) {
              profileImageIdsToCleanup.push(existingProfileImageId.value)
            }
            await this.mediaGateway.saveStagedImageMetadata(preparedImage)
            user.setProfileImage(newProfileImageId, updatedBy)
          }
        }

        await this.userWriteRepository.update(user)
        return [user]
      })

      if (preparedImage) {
        await this.mediaGateway.promoteImageVersion({
          promotedById: updatedBy.value,
          imageId: preparedImage.imageId,
          stagedVersionId: preparedImage.stagedVersionId
        })
      }

      for (const imageId of profileImageIdsToCleanup) {
        await this.profileImageCleanupService.deleteProfileImageIfUnreferenced(imageId, updatedBy.value)
      }

      this.userLookupService.invalidateById(updatedUser.id)
      userProfileUpdated(this.userApplicationMapper.toProfileDTO(updatedUser))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
