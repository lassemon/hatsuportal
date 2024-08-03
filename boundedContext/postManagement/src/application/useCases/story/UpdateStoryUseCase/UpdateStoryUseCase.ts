import { ConcurrencyError, IUseCase, IUseCaseOptions, NotFoundError, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum, Logger } from '@hatsuportal/common'
import { NonEmptyString, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ImageAttachmentReadModelDTO, UpdateStoryInputDTO } from '../../../dtos'
import { StoryWithRelationsDTO } from '../../../dtos'
import { CoverImageId, IStoryWriteRepository, ITagRepository, PostId, PostVisibility, Story, TagId } from '../../../../domain'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'

import ImageLoadResult from '../../../acl/mediaManagement/outcomes/ImageLoadResult'
import { isUndefined } from 'lodash'
import { IResolveStoryTagIdsService } from '../../../services/tag/ResolveStoryTagIdsService'

const logger = new Logger('UpdateStoryUseCase')

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
    private readonly storyRepository: IStoryWriteRepository & ITransactionAware,
    private readonly storyLookupService: IStoryLookupService,
    private readonly tagRepository: ITagRepository & ITransactionAware,
    private readonly resolveStoryTagIdsService: IResolveStoryTagIdsService,
    private readonly transactionManager: ITransactionManager<PostId, UnixTimestamp>
  ) {}
  async execute({ updatedById, updateStoryInput, storyUpdated, updateConflict }: IUpdateStoryUseCaseOptions) {
    const updatedBy = new UniqueId(updatedById)
    let imageIdForStory: string | null = null
    let stagedVersionId: string | null = null

    try {
      const [savedStory] = await this.transactionManager.execute<[Story]>(async () => {
        const existingStory = await this.storyRepository.findByIdForUpdate(new PostId(updateStoryInput.id))

        const coverImageLoadResult = !existingStory?.coverImageId.equals(CoverImageId.NOT_SET)
          ? await this.mediaGateway.getImageById({ imageId: existingStory!.coverImageId.value })
          : ImageLoadResult.notSet()

        // can check and throw for isFailed because notSet is not a failure
        if (coverImageLoadResult.isFailed()) throw new NotFoundError('Cover image not found.')

        const updatedStory = existingStory!.clone()

        if (!isUndefined(updateStoryInput.name)) updatedStory!.rename(new NonEmptyString(updateStoryInput.name), updatedBy)

        if (!isUndefined(updateStoryInput.visibility))
          updatedStory!.updateVisibility(new PostVisibility(updateStoryInput.visibility), updatedBy)

        if (!isUndefined(updateStoryInput.description))
          updatedStory!.updateDescription(new NonEmptyString(updateStoryInput.description), updatedBy)

        if (!isUndefined(updateStoryInput.image)) {
          const currentImage = coverImageLoadResult.isNotSet() ? null : coverImageLoadResult.value
          const { imageIdForStory: newImageIdForStory, stagedVersionId: newStagedVersionId } = await this.syncCoverImage(
            updatedBy,
            updatedStory!.id.value,
            currentImage,
            updateStoryInput.image
          )
          if (newStagedVersionId) stagedVersionId = newStagedVersionId
          if (newImageIdForStory) imageIdForStory = newImageIdForStory
          imageIdForStory
            ? updatedStory!.updateCoverImage(new CoverImageId(imageIdForStory), updatedBy)
            : updatedStory!.updateCoverImage(CoverImageId.NOT_SET, updatedBy)
        }

        if (!isUndefined(updateStoryInput.tags)) {
          const tagsForStory = await this.resolveStoryTagIdsService.resolve(updatedBy, updateStoryInput.tags)
          updatedStory!.setNewTags(
            tagsForStory.map((tag) => new TagId(tag)),
            updatedBy
          )
        }

        await this.storyRepository.update(updatedStory)

        // Added a new image, promote it to current
        if (!isUndefined(updateStoryInput.image) && imageIdForStory && stagedVersionId) {
          await this.mediaGateway.promoteImageVersion({
            promotedById: updatedBy.value,
            imageId: imageIdForStory,
            stagedVersionId: stagedVersionId
          })
        }

        // returning the story here will trigger transaction manager to commit the transaction
        return [updatedStory]
      }, [this.storyRepository, this.tagRepository])

      const dtoWithRelations = await this.storyLookupService.findById(savedStory.id)

      if (!dtoWithRelations) {
        throw new NotFoundError('Story updated but not found in lookup service.')
      }

      storyUpdated(dtoWithRelations)
    } catch (error) {
      if (stagedVersionId && imageIdForStory) {
        try {
          await this.mediaGateway.discardImageVersion({
            discardedById: updatedBy.value,
            imageId: imageIdForStory,
            stagedVersionId: stagedVersionId
          })
        } catch (error) {
          logger.error(`Failed to discard staged image version ${imageIdForStory} ${stagedVersionId}`, error)
        }
      }
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }

  private async syncCoverImage(
    updatedBy: UniqueId,
    storyId: string,
    currentImage: ImageAttachmentReadModelDTO | null,
    input: UpdateStoryInputDTO['image'] | null
  ): Promise<{ imageIdForStory: string | null; stagedVersionId?: string | null }> {
    // 1. Remove cover image ──────────────────────────────────────────────
    if (input === null) {
      if (currentImage) await this.mediaGateway.deleteImage({ imageId: currentImage.id, deletedById: updatedBy.value })
      return { imageIdForStory: null }
    }

    // 2. Add cover image
    if (!currentImage) {
      const createStagedImageResult = await this.mediaGateway.createStagedImageVersion({
        role: ImageRoleEnum.Cover,
        mimeType: input?.mimeType ?? '',
        size: input?.size ?? 0,
        ownerEntityType: EntityTypeEnum.Story,
        ownerEntityId: storyId,
        base64: input?.base64 ?? '',
        createdById: updatedBy.value
      })
      return { imageIdForStory: createStagedImageResult.imageId, stagedVersionId: createStagedImageResult.stagedVersionId }
    } else {
      // 3. or Replace cover image
      return {
        imageIdForStory: (
          await this.mediaGateway.updateImage({
            updatedById: updatedBy.value,
            imageId: currentImage.id,
            mimeType: input?.mimeType ?? '',
            size: input?.size ?? 0,
            base64: input?.base64 ?? ''
          })
        ).id
      }
    }
  }
}
