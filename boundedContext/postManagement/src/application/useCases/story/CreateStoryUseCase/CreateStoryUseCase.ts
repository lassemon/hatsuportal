import { EntityTypeEnum, ImageRoleEnum, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  AuthenticationError,
  NotFoundError,
  IUseCase,
  IUseCaseOptions,
  ITransactionAware,
  ITransactionManager
} from '@hatsuportal/platform'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IStoryWriteRepository, PostCreatorId, PostId, PostVisibility, Story } from '../../../../domain'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { IMediaGateway } from '../../../acl/mediaManagement/IMediaGateway'
import { CoverImageId } from '../../../../domain/valueObjects/CoverImageId'
import { CreateStoryInputDTO, StoryWithRelationsDTO } from '../../../dtos'

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
    private readonly storyWriteRepository: IStoryWriteRepository & ITransactionAware,
    private readonly storyLookupService: IStoryLookupService,
    private readonly transactionManager: ITransactionManager<PostId, UnixTimestamp>
  ) {}
  async execute({ createdById, createStoryInput, storyCreated }: ICreateStoryUseCaseOptions) {
    const loadUserResult = await this.userGateway.getUserById({ userId: createdById })
    if (loadUserResult.isFailed()) throw new AuthenticationError('Not logged in.')
    const loggedInUser = loadUserResult.value

    const [savedStory] = await this.transactionManager.execute<[Story]>(async () => {
      const { image: storyImageInput } = createStoryInput
      // Logged in user is not null because we already checked for it in the validation
      const loggedInUserId = loggedInUser!.id

      const now = unixtimeNow()

      const story = Story.create({
        id: new PostId(uuid()),
        visibility: new PostVisibility(createStoryInput.visibility),
        name: new NonEmptyString(createStoryInput.name.trim()),
        description: new NonEmptyString(createStoryInput.description.trim()),
        coverImageId: null,
        createdById: new PostCreatorId(loggedInUserId),
        createdAt: new UnixTimestamp(now),
        updatedAt: new UnixTimestamp(now),
        tagIds: [] // TODO, allow creation of story with tags, add tagIds from create input here
      })

      let stagedImageVersionResult: mediaV1.CreateStagedImageVersionResult | null = null

      if (storyImageInput) {
        stagedImageVersionResult = await this.mediaGateway.createStagedImageVersion({
          ownerEntityType: EntityTypeEnum.Story,
          ownerEntityId: story.id.value,
          role: ImageRoleEnum.Cover,
          mimeType: storyImageInput.mimeType,
          size: storyImageInput.size,
          base64: storyImageInput.base64,
          createdById: loggedInUserId
        })

        story.updateCoverImage(new CoverImageId(stagedImageVersionResult.imageId), false)
      }

      const savedStory = await this.storyWriteRepository.insert(story)

      if (stagedImageVersionResult) {
        await this.mediaGateway.promoteImageVersion({
          imageId: stagedImageVersionResult.imageId,
          stagedVersionId: stagedImageVersionResult.stagedVersionId
        })
      }

      // returning the story here will trigger transaction manager to commit the transaction
      return [savedStory]
    }, [this.storyWriteRepository])

    const dtoWithRelations = await this.storyLookupService.findById(savedStory.id)

    if (!dtoWithRelations) {
      throw new NotFoundError('Story created but not found in lookup service.')
    }

    storyCreated(dtoWithRelations)
  }
}
