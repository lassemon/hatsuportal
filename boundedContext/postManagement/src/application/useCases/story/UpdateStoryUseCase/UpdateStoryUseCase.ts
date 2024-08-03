import { ConcurrencyError, IUseCase, IUseCaseOptions, NotFoundError, IUnitOfWork } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { NonEmptyString, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { UpdateStoryInputDTO } from '../../../dtos'
import { StoryWithRelationsDTO } from '../../../dtos'
import { CoverImageId, IStoryWriteRepository, PostId, PostVisibility, Story, TagId } from '../../../../domain'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'

import { isUndefined } from 'lodash'
import { IResolveStoryTagIdsService } from '../../../services/tag/ResolveStoryTagIdsService'
import { IStoryCoverImageCleanupService } from '../../../services/story/StoryCoverImageCleanupService'

export interface IUpdateStoryUseCaseOptions extends IUseCaseOptions {
  updatedById: string
  updateStoryInput: UpdateStoryInputDTO
  storyUpdated(story: StoryWithRelationsDTO): void
  updateConflict(error: ConcurrencyError<Story>): void
}

export type IUpdateStoryUseCase = IUseCase<IUpdateStoryUseCaseOptions>

export class UpdateStoryUseCase implements IUpdateStoryUseCase {
  constructor(
    private readonly mediaGateway: IMediaGateway,
    private readonly storyRepository: IStoryWriteRepository,
    private readonly storyLookupService: IStoryLookupService,
    private readonly resolveStoryTagIdsService: IResolveStoryTagIdsService,
    private readonly storyCoverImageCleanupService: IStoryCoverImageCleanupService,
    private readonly unitOfWork: IUnitOfWork<PostId, UnixTimestamp>
  ) {}
  async execute({ updatedById, updateStoryInput, storyUpdated, updateConflict }: IUpdateStoryUseCaseOptions) {
    const updatedBy = new UniqueId(updatedById)
    // Old cover images removed or replaced during this update; delete them afterward if no other story still uses them.
    const coverImageIdsToCleanup: string[] = []

    let preparedImage: mediaV1.PreparedStagedImageContract | null = null
    if (!isUndefined(updateStoryInput.image) && updateStoryInput.image !== null) {
      preparedImage = await this.mediaGateway.prepareStagedImageFile({
        role: ImageRoleEnum.Cover,
        mimeType: updateStoryInput.image.mimeType ?? '',
        size: updateStoryInput.image.size ?? 0,
        ownerEntityType: EntityTypeEnum.Story,
        ownerEntityId: updateStoryInput.id,
        base64: updateStoryInput.image.base64 ?? '',
        createdById: updatedBy.value
      })
    }

    try {
      const [savedStory] = await this.unitOfWork.execute<[Story]>(async () => {
        if (preparedImage) {
          await this.mediaGateway.registerPreparedStagedImageFileRollbackCleanup(preparedImage)
        }

        const existingStory = await this.storyRepository.findByIdForUpdate(new PostId(updateStoryInput.id))
        if (!existingStory) {
          throw new NotFoundError('Story not found.')
        }

        const updatedStory = existingStory.clone()

        if (!isUndefined(updateStoryInput.title)) updatedStory.rename(new NonEmptyString(updateStoryInput.title), updatedBy)

        if (!isUndefined(updateStoryInput.visibility))
          updatedStory.updateVisibility(new PostVisibility(updateStoryInput.visibility), updatedBy)

        if (!isUndefined(updateStoryInput.body)) updatedStory.updateBody(new NonEmptyString(updateStoryInput.body), updatedBy)

        if (!isUndefined(updateStoryInput.image)) {
          const existingCoverId = existingStory.coverImageId

          if (updateStoryInput.image === null) {
            if (!existingCoverId.equals(CoverImageId.NOT_SET)) {
              // User cleared the cover — the story no longer needs this image.
              coverImageIdsToCleanup.push(existingCoverId.value)
            }
            updatedStory.updateCoverImage(CoverImageId.NOT_SET, updatedBy)
          } else if (preparedImage) {
            const newCoverImageId = new CoverImageId(preparedImage.imageId)
            const replacingCoverImage = !existingCoverId.equals(CoverImageId.NOT_SET) && !existingCoverId.equals(newCoverImageId)
            if (replacingCoverImage) {
              // User uploaded a new cover — the previous one is no longer needed
              coverImageIdsToCleanup.push(existingCoverId.value)
            }
            await this.mediaGateway.saveStagedImageMetadata(preparedImage)
            updatedStory.updateCoverImage(newCoverImageId, updatedBy)
          }
        }

        if (!isUndefined(updateStoryInput.tags)) {
          const tagsForStory = await this.resolveStoryTagIdsService.resolve(updatedBy, updateStoryInput.tags)
          updatedStory.setNewTags(
            tagsForStory.map((tag) => new TagId(tag)),
            updatedBy
          )
        }

        await this.storyRepository.update(updatedStory)
        return [updatedStory]
      })

      if (preparedImage) {
        await this.mediaGateway.promoteImageVersion({
          promotedById: updatedBy.value,
          imageId: preparedImage.imageId,
          stagedVersionId: preparedImage.stagedVersionId
        })
      }

      for (const imageId of coverImageIdsToCleanup) {
        await this.storyCoverImageCleanupService.deleteCoverImageIfUnreferenced(imageId, updatedBy.value)
      }

      this.storyLookupService.invalidateById(savedStory.id)
      const dtoWithRelations = await this.storyLookupService.findById(savedStory.id)

      if (!dtoWithRelations) {
        throw new NotFoundError('Story updated but not found in lookup service.')
      }

      storyUpdated(dtoWithRelations)
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
