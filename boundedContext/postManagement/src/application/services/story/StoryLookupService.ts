import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { ApplicationError, AuthenticationError } from '@hatsuportal/platform'
import { OrderEnum, StorySortableKeyEnum, Logger, toHumanReadableJson } from '@hatsuportal/common'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { ICommentLookupService } from '../comment/CommentLookupService'
import { IStoryReadRepository } from '../../read/IStoryReadRepository'
import {
  CommentWithRelationsDTO,
  ImageAttachmentReadModelDTO,
  StoryReadModelDTO,
  StorySearchCriteriaDTO,
  StoryWithRelationsDTO
} from '../../dtos'
import { ITagRepository, PostCreatorId, PostId, TagId } from '../../../domain'
import { IMediaGateway } from '../../acl/mediaManagement/IMediaGateway'
import { IStoryApplicationMapper } from '../../mappers/StoryApplicationMapper'
import ImageLoadResult from '../../acl/mediaManagement/outcomes/ImageLoadResult'
import { ImageLoadError } from '../../acl/mediaManagement/errors/ImageLoadError'

const logger = new Logger('StoryLookupService')

export interface IStoryLookupService {
  count(query: StorySearchCriteriaDTO): Promise<number>
  search(query: StorySearchCriteriaDTO): Promise<StoryWithRelationsDTO[]>
  findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<StoryWithRelationsDTO[]>
  findById(id: PostId): Promise<StoryWithRelationsDTO | null>
  findByImageId(imageId: PostId): Promise<StoryWithRelationsDTO[]>
  findAllVisibleForLoggedInCreator(
    creatorId: PostCreatorId,
    orderBy: StorySortableKeyEnum,
    order: OrderEnum
  ): Promise<StoryWithRelationsDTO[]>
  findAllForCreator(creatorId: PostCreatorId): Promise<StoryWithRelationsDTO[]>
  findLatest(limit: number, loggedIn: boolean): Promise<StoryWithRelationsDTO[]>
  findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<StoryWithRelationsDTO[]>
}

export class StoryLookupService implements IStoryLookupService {
  constructor(
    private readonly storyRepository: IStoryReadRepository,
    private readonly mediaGateway: IMediaGateway,
    private readonly tagRepository: ITagRepository,
    private readonly userGateway: IUserGateway,
    private readonly commentLookupService: ICommentLookupService,
    private readonly storyApplicationMapper: IStoryApplicationMapper
  ) {}

  async count(query: StorySearchCriteriaDTO): Promise<number> {
    return await this.storyRepository.count(query)
  }

  async search(query: StorySearchCriteriaDTO): Promise<StoryWithRelationsDTO[]> {
    const stories = await this.storyRepository.search(query)
    return this.enrichMany(stories)
  }

  async findAllPublic(orderBy: StorySortableKeyEnum, order: OrderEnum): Promise<StoryWithRelationsDTO[]> {
    const stories = await this.storyRepository.findAllPublic(orderBy, order)
    return this.enrichMany(stories)
  }

  async findById(id: PostId): Promise<StoryWithRelationsDTO | null> {
    const story = await this.storyRepository.findById(id)
    return story ? this.enrichOne(story) : null
  }

  async findByImageId(imageId: PostId): Promise<StoryWithRelationsDTO[]> {
    const stories = await this.storyRepository.findByImageId(imageId)
    return this.enrichMany(stories)
  }

  async findAllVisibleForLoggedInCreator(
    creatorId: PostCreatorId,
    orderBy: StorySortableKeyEnum,
    order: OrderEnum
  ): Promise<StoryWithRelationsDTO[]> {
    const stories = await this.storyRepository.findAllVisibleForLoggedInCreator(creatorId, orderBy, order)
    return this.enrichMany(stories)
  }

  async findAllForCreator(creatorId: PostCreatorId): Promise<StoryWithRelationsDTO[]> {
    const stories = await this.storyRepository.findAllForCreator(creatorId)
    return this.enrichMany(stories)
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<StoryWithRelationsDTO[]> {
    const stories = await this.storyRepository.findLatest(limit, loggedIn)
    return this.enrichMany(stories)
  }

  async findStoriesOfCreatorByName(storyName: string, creatorId: PostCreatorId): Promise<StoryWithRelationsDTO[]> {
    const stories = await this.storyRepository.findStoriesOfCreatorByName(storyName, creatorId)
    return this.enrichMany(stories)
  }

  private async enrichMany(baseStories: StoryReadModelDTO[]): Promise<StoryWithRelationsDTO[]> {
    return Promise.all(baseStories.map((story) => this.enrichOne(story)))
  }

  private async enrichOne(baseStory: StoryReadModelDTO): Promise<StoryWithRelationsDTO> {
    const creatorLoadResult = await this.userGateway.getUserById({ userId: baseStory.createdById })
    if (creatorLoadResult.isFailed()) {
      throw new AuthenticationError('Creator not found')
    }

    const coverImageResult = await this.loadImageSafely(baseStory.coverImageId ? baseStory.coverImageId : null)
    const tags = await this.tagRepository.findByIds(baseStory.tagIds.map((tagId) => new TagId(tagId)))
    const enrichedComments = await this.loadEnrichedCommentList(baseStory)

    // TODO, get creator.name separately for story and for image
    const creator = creatorLoadResult.value
    return this.storyApplicationMapper.toDTOWithRelations(baseStory, creator.name, coverImageResult, creator.name, tags, enrichedComments)
  }

  private async loadImageSafely(imageId: string | null): Promise<ImageLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>> {
    logger.debug('Loading image with media gateway', imageId)
    if (!imageId) {
      return ImageLoadResult.notSet()
    }

    try {
      const image = await this.mediaGateway.getImageById({ imageId })
      if (image.isFailed()) {
        throw image.error!
      }
      return image
    } catch (error) {
      if (error instanceof Error) {
        logger.warn(`Failed to load image ${imageId}: ${error.message}`)
        return ImageLoadResult.failedToLoad(imageId, error)
      } else {
        logger.warn(`Failed to load image ${imageId}: Unknown error occurred, Error instance: ${typeof error}`)
        logger.debug('Error details', toHumanReadableJson(error))
        return ImageLoadResult.failedToLoad(imageId, new ApplicationError({ message: 'Unknown error occurred', cause: error }))
      }
    }
  }

  private async loadEnrichedCommentList(story: StoryReadModelDTO): Promise<CommentWithRelationsDTO[]> {
    const commentListChunk = await this.commentLookupService.listTopLevelForPost(new PostId(story.id), {
      limit: new NonNegativeInteger(10),
      cursor: undefined,
      sort: OrderEnum.Descending,
      replyPreviewOptions: { perParentLimit: new NonNegativeInteger(4) }
    })

    return await Promise.all(
      commentListChunk.comments.map(async (comment: CommentWithRelationsDTO) => {
        const authorLoadResult = await this.userGateway.getUserById({ userId: comment.authorId })
        if (authorLoadResult.isFailed()) {
          throw new ApplicationError(`Author not found for comment ${comment.id}`)
        }

        return {
          ...comment,
          authorName: authorLoadResult.value.name
        }
      })
    )
  }
}
