import { NotFoundError } from '@hatsuportal/platform'
import { IMediaGateway } from '../../acl/mediaManagement/IMediaGateway'
import { IUserReadRepository } from '../../read/IUserReadRepository'
import { ProfileImageId } from '../../../domain'

export interface IProfileImageCleanupService {
  deleteProfileImageIfUnreferenced(imageId: string, deletedById: string): Promise<void>
}

export class ProfileImageCleanupService implements IProfileImageCleanupService {
  constructor(
    private readonly userReadRepository: IUserReadRepository,
    private readonly mediaGateway: IMediaGateway
  ) {}

  async deleteProfileImageIfUnreferenced(imageId: string, deletedById: string): Promise<void> {
    const referencingUsers = await this.userReadRepository.findByProfileImageId(new ProfileImageId(imageId))
    if (referencingUsers.length > 0) {
      return
    }

    try {
      await this.mediaGateway.deleteImage({ deletedById, imageId })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return
      }
      throw error
    }
  }
}
