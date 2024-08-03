import { EntityTypeEnum, ImageRoleEnum, Logger, unixtimeNow, uuid } from '@hatsuportal/common'
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

const logger = new Logger('CreateStoryUseCase')

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
    const loggedInUserId = loggedInUser!.id

    const { image: storyImageInput } = createStoryInput
    const storyId = new PostId(uuid())

    let stagedImageVersionResult: mediaV1.CreateStagedImageVersionResult | null = null

    try {
      if (storyImageInput) {
        stagedImageVersionResult = await this.mediaGateway.createStagedImageVersion({
          ownerEntityType: EntityTypeEnum.Story,
          ownerEntityId: storyId.value,
          role: ImageRoleEnum.Cover,
          mimeType: storyImageInput.mimeType,
          size: storyImageInput.size,
          base64: storyImageInput.base64,
          createdById: loggedInUserId
        })
      }

      const [savedStory] = await this.transactionManager.execute<[Story]>(async () => {
        // Logged in user is not null because we already checked for it in the validation

        const now = unixtimeNow()

        const story = Story.create({
          id: storyId,
          visibility: new PostVisibility(createStoryInput.visibility),
          name: new NonEmptyString(createStoryInput.name.trim()),
          description: new NonEmptyString(createStoryInput.description.trim()),
          coverImageId: stagedImageVersionResult ? new CoverImageId(stagedImageVersionResult.imageId) : CoverImageId.NOT_SET,
          createdById: new PostCreatorId(loggedInUserId),
          createdAt: new UnixTimestamp(now),
          updatedAt: new UnixTimestamp(now),
          tagIds: [] // TODO, allow creation of story with tags, add tagIds from create input here
        })

        await this.storyWriteRepository.insert(story)

        if (stagedImageVersionResult) {
          await this.mediaGateway.promoteImageVersion({
            promotedById: loggedInUserId,
            imageId: stagedImageVersionResult.imageId,
            stagedVersionId: stagedImageVersionResult.stagedVersionId
          })
        }

        // returning the story here will trigger transaction manager to commit the transaction
        return [story]
      }, [this.storyWriteRepository])

      const dtoWithRelations = await this.storyLookupService.findById(savedStory.id)
      if (!dtoWithRelations) {
        throw new NotFoundError('Story created but not found in lookup service.')
      }

      storyCreated(dtoWithRelations)
    } catch (error) {
      // Compensate: discard the staged image that was committed
      // in the media bounded context's independent transaction
      if (stagedImageVersionResult) {
        try {
          await this.mediaGateway.discardImageVersion({
            discardedById: loggedInUserId,
            imageId: stagedImageVersionResult.imageId,
            stagedVersionId: stagedImageVersionResult.stagedVersionId
          })
        } catch (error) {
          // best-effort; cleanup job handles stragglers
          logger.error(
            `Failed to discard staged image version ${stagedImageVersionResult.imageId} ${stagedImageVersionResult.stagedVersionId}`,
            error
          )
        }
      }
      throw error
    }
  }
}
