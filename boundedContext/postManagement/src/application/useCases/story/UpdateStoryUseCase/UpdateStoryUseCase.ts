import { ConcurrencyError, IUseCase, IUseCaseOptions, NotFoundError, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum, unixtimeNow, uuid } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ImageAttachmentReadModelDTO, UpdateStoryInputDTO } from '../../../dtos'
import { StoryWithRelationsDTO } from '../../../dtos'
import { CoverImageId, IStoryWriteRepository, ITagRepository, PostId, PostVisibility, Story, Tag, TagId, TagSlug } from '../../../../domain'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'

import ImageLoadResult from '../../../acl/mediaManagement/outcomes/ImageLoadResult'
import { TagCreatorId } from '../../../../domain/valueObjects/TagCreatorId'
import { isUndefined } from 'lodash'

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
    private readonly transactionManager: ITransactionManager<PostId, UnixTimestamp>
  ) {}
  async execute({ updatedById, updateStoryInput, storyUpdated, updateConflict }: IUpdateStoryUseCaseOptions) {
    try {
      const [savedStory] = await this.transactionManager.execute<[Story]>(async () => {
        const existingStory = await this.storyRepository.findByIdForUpdate(new PostId(updateStoryInput.id))
        let imageIdForStory: string | null = null
        let stagedVersionId: string | null = null

        const coverImageLoadResult = existingStory!.coverImageId
          ? await this.mediaGateway.getImageById({ imageId: existingStory!.coverImageId.value })
          : ImageLoadResult.notSet()

        // can check and throw for isFailed because notSet is not a failure
        if (coverImageLoadResult.isFailed()) throw new NotFoundError('Cover image not found.')

        const updatedStory = existingStory!.clone()

        if (!isUndefined(updateStoryInput.name)) updatedStory!.rename(new NonEmptyString(updateStoryInput.name))

        if (!isUndefined(updateStoryInput.visibility)) updatedStory!.updateVisibility(new PostVisibility(updateStoryInput.visibility))

        if (!isUndefined(updateStoryInput.description)) updatedStory!.updateDescription(new NonEmptyString(updateStoryInput.description))

        if (!isUndefined(updateStoryInput.image)) {
          const currentImage = coverImageLoadResult.isNotSet() ? null : coverImageLoadResult.value
          const { imageIdForStory: newImageIdForStory, stagedVersionId: newStagedVersionId } = await this.syncCoverImage(
            updatedById,
            updatedStory!.id.value,
            currentImage,
            updateStoryInput.image
          )
          if (newStagedVersionId) stagedVersionId = newStagedVersionId
          if (newImageIdForStory) imageIdForStory = newImageIdForStory
          imageIdForStory ? updatedStory!.updateCoverImage(new CoverImageId(imageIdForStory)) : updatedStory!.updateCoverImage(null)
        }

        if (!isUndefined(updateStoryInput.tags)) {
          const currentTags = await this.tagRepository.findByIds(updatedStory!.tagIds)
          const { tagsForStory } = await this.syncTags(updatedById, updateStoryInput, currentTags)
          updatedStory!.setNewTags(tagsForStory.map((tag) => new TagId(tag)))
        }

        const savedStory = await this.storyRepository.update(updatedStory)

        // Added a new image, promote it to current
        if (!isUndefined(updateStoryInput.image) && imageIdForStory && stagedVersionId) {
          await this.mediaGateway.promoteImageVersion({
            imageId: imageIdForStory,
            stagedVersionId: stagedVersionId
          })
        }

        // returning the story here will trigger transaction manager to commit the transaction
        return [savedStory]
      }, [this.storyRepository, this.tagRepository])

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

  private async syncCoverImage(
    updatedById: string,
    storyId: string,
    currentImage: ImageAttachmentReadModelDTO | null,
    input: UpdateStoryInputDTO['image'] | null | undefined
  ): Promise<{ imageIdForStory: string | null; stagedVersionId?: string | null }> {
    // 1. Remove cover image ──────────────────────────────────────────────
    if (input === null) {
      if (currentImage) await this.mediaGateway.deleteImage({ imageId: currentImage.id, deletedById: updatedById })
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
        createdById: updatedById
      })
      return { imageIdForStory: createStagedImageResult.imageId, stagedVersionId: createStagedImageResult.stagedVersionId }
    } else {
      // 3. or Replace cover image
      return {
        imageIdForStory: (
          await this.mediaGateway.updateImage({
            updatedById: updatedById,
            imageId: currentImage.id,
            mimeType: input?.mimeType ?? '',
            size: input?.size ?? 0,
            base64: input?.base64 ?? ''
          })
        ).id
      }
    }
  }

  private async syncTags(createdById: string, input: UpdateStoryInputDTO, currentTags: Tag[]): Promise<{ tagsForStory: string[] }> {
    const incomingTags =
      input?.tags ??
      currentTags.map((tag) => ({
        id: tag.id.value
      }))
    const tagsToAttach = incomingTags.filter((tag) => 'name' in tag)
    const tagsToAdd = incomingTags.filter((tag) => 'id' in tag)

    const now = unixtimeNow()

    const tagsToInsert = tagsToAttach.map((tag) =>
      Tag.create({
        id: new TagId(uuid()),
        name: new NonEmptyString(tag.name),
        slug: new TagSlug(tag.name),
        createdById: new TagCreatorId(createdById),
        createdAt: new UnixTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      })
    )

    const created = tagsToInsert.length > 0 ? await this.tagRepository.insertMany(tagsToInsert) : []
    const tagsForStory = [...tagsToAdd.map((i) => i.id), ...created.map((tag) => tag.id.value)]

    // it's ok here if we return an empty array or an array containing the current tags
    // (if the original update request did not contain tags, we will not update tags)
    return { tagsForStory }
  }
}
