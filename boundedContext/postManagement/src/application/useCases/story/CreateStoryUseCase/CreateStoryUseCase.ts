import { EntityTypeEnum, ImageRoleEnum, unixtimeNow, uuid } from '@hatsuportal/common'
import { AuthenticationError, NotFoundError, IUseCase, IUseCaseOptions, IUnitOfWork } from '@hatsuportal/platform'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { CreatedAtTimestamp, NonEmptyString, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IStoryWriteRepository, PostCreatorId, PostId, PostVisibility, Story, TagId } from '../../../../domain'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'
import { CoverImageId } from '../../../../domain/valueObjects/CoverImageId'
import { CreateStoryInputDTO, StoryWithRelationsDTO } from '../../../dtos'
import { IResolveStoryTagIdsService } from '../../../services/tag/ResolveStoryTagIdsService'

export interface ICreateStoryUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createStoryInput: CreateStoryInputDTO
  storyCreated(createdStory: StoryWithRelationsDTO): void
}

export type ICreateStoryUseCase = IUseCase<ICreateStoryUseCaseOptions>

export class CreateStoryUseCase implements ICreateStoryUseCase {
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly mediaGateway: IMediaGateway,
    private readonly storyWriteRepository: IStoryWriteRepository,
    private readonly storyLookupService: IStoryLookupService,
    private readonly resolveStoryTagIdsService: IResolveStoryTagIdsService,
    private readonly unitOfWork: IUnitOfWork<PostId, UnixTimestamp>
  ) {}
  async execute({ createdById, createStoryInput, storyCreated }: ICreateStoryUseCaseOptions) {
    const loadUserResult = await this.userGateway.getUserById({ userId: createdById })
    if (loadUserResult.isFailed()) throw new AuthenticationError('Not logged in.')
    const loggedInUser = loadUserResult.value
    const loggedInUserId = loggedInUser!.id

    const { image: storyImageInput, tags: storyTagsInput } = createStoryInput
    const storyId = new PostId(uuid())

    let preparedImage: mediaV1.PreparedStagedImageContract | null = null

    if (storyImageInput) {
      preparedImage = await this.mediaGateway.prepareStagedImageFile({
        ownerEntityType: EntityTypeEnum.Story,
        ownerEntityId: storyId.value,
        role: ImageRoleEnum.Cover,
        mimeType: storyImageInput.mimeType,
        size: storyImageInput.size,
        base64: storyImageInput.base64,
        createdById: loggedInUserId
      })
    }

    const [savedStory] = await this.unitOfWork.execute<[Story]>(async () => {
      if (preparedImage) {
        await this.mediaGateway.registerPreparedStagedImageFileRollbackCleanup(preparedImage)
      }

      const now = unixtimeNow()
      const tagsForStory =
        storyTagsInput?.length > 0 ? await this.resolveStoryTagIdsService.resolve(new UniqueId(loggedInUserId), storyTagsInput) : []

      const story = Story.create({
        id: storyId,
        visibility: new PostVisibility(createStoryInput.visibility),
        title: new NonEmptyString(createStoryInput.title.trim()),
        body: new NonEmptyString(createStoryInput.body.trim()),
        coverImageId: preparedImage ? new CoverImageId(preparedImage.imageId) : CoverImageId.NOT_SET,
        createdById: new PostCreatorId(loggedInUserId),
        createdAt: new CreatedAtTimestamp(now),
        updatedAt: new UnixTimestamp(now),
        tagIds: tagsForStory.map((tag) => new TagId(tag))
      })

      if (preparedImage) {
        await this.mediaGateway.saveStagedImageMetadata(preparedImage)
      }

      await this.storyWriteRepository.insert(story)
      return [story]
    })

    if (preparedImage) {
      await this.mediaGateway.promoteImageVersion({
        promotedById: loggedInUserId,
        imageId: preparedImage.imageId,
        stagedVersionId: preparedImage.stagedVersionId
      })
    }

    this.storyLookupService.invalidateById(savedStory.id)

    const dtoWithRelations = await this.storyLookupService.findById(savedStory.id)
    if (!dtoWithRelations) {
      throw new NotFoundError('Story created but not found in lookup service.')
    }

    storyCreated(dtoWithRelations)
  }
}
