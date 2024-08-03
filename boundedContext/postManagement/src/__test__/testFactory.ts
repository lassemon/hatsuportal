import { Mocked, vi } from 'vitest'
import { StoryDatabaseSchema } from '../infrastructure/schemas/StoryDatabaseSchema'
import {
  IStoryWriteRepository,
  ITagRepository,
  PostCreatorId,
  PostId,
  PostVisibility,
  Recipe,
  RecipeProps,
  Story,
  StoryProps,
  Tag,
  TagId,
  TagSlug
} from '../domain'
import { StoryReadDatabaseSchema } from '../infrastructure/schemas/StoryReadDatabaseSchema'
import { EntityLoadResult } from '@hatsuportal/platform'
import { IUserGateway } from '../application/acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../application/dtos/user/UserReadModelDTO'
import { EntityTypeEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { CreatedAtTimestamp, IDomainEventDispatcher, IDomainEventHolder, NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { cloneDeep } from 'lodash'
import { CoverImageId } from '../domain/valueObjects/CoverImageId'
import { IMediaGateway } from '../application/acl/mediaManagement/IMediaGateway'
import { ImageAttachmentReadModelDTO } from '../application/dtos/image/ImageAttachmentReadModelDTO'
import { IStoryLookupService } from '../application/services/story/StoryLookupService'
import { IStoryCoverImageCleanupService } from '../application/services/story/StoryCoverImageCleanupService'
import { IStoryListSearchService } from '../application/services/story/StoryListSearchService'
import { IPostReadRepository } from '../application/read/IPostReadRepository'
import { TagDTO } from '../application/dtos/post/TagDTO'
import { TagCreatorId } from '../domain/valueObjects/TagCreatorId'
import { PostDatabaseSchema } from '../infrastructure/schemas/PostDatabaseSchema'
import { IStoryAuthorizationService } from '../application/authorization/services/StoryAuthorizationService'
import { ICommentAuthorizationService, IResolveStoryTagIdsService, IStoryReadRepository, StoryReadModelDTO } from '../application'
import { IPostWriteRepository } from '../infrastructure'
import { IDomainEventService, ITransactionAware, IUnitOfWork } from '@hatsuportal/platform'
import { CreateStoryRequest, SearchPostsRequest, SearchStoriesRequest, StoryResponse, UpdateStoryRequest } from '@hatsuportal/contracts'
import { CommentDatabaseSchema } from '../infrastructure/schemas/CommentDatabaseSchema'
import { Comment, CommentAuthorId, CommentId, CommentProps, ICommentWriteRepository } from '../domain'
import { CommentDTO } from '../application/dtos/comment/CommentDTO'
import { CommentReadModelDTO } from '../application/dtos/comment/CommentReadModelDTO'
import { CommentWithRelationsDTO } from '../application/dtos/comment/CommentWithRelationsDTO'
import { CommentListChunkDTO } from '../application/dtos/comment/CommentListChunkDTO'
import { RepliesPreviewDTO } from '../application/dtos/comment/RepliesPreviewDTO'
import { ICommentLookupService } from '../application/services/comment/CommentLookupService'
import { ICommentReadRepository } from '../application/read/ICommentReadRepository'
import { PostDTO } from '../application/dtos/post/PostDTO'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const sampleUserId = 'test1b19-user-4792-a2f0-f95ccab82d92'
export const sampleNonAuthorUserId = 'test2b19-user-4792-a2f0-f95ccab82d93'
export const sampleUserName = 'testUserName'
export const sampleStoryId = 'test1b19-story-4792-a2f0-f95ccab82d92'
export const sampleRecipeId = 'test1b19-recipe-4792-a2f0-f95ccab82d92'
export const sampleImageId = 'test1b19-image-4792-a2f0-f95ccab82d92'
export const sampleTagId = 'test1b19-tag-4792-a2f0-f95ccab82d92-a2f0-f95cc2met'
export const sampleCommentId = 'test1b19-comment-4792-a2f0-f95ccab82d92'
export const sampleParentCommentId = 'test2b19-comment-4792-a2f0-f95ccab82d93'

// for detecting instance of
export class TestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const postDatabaseRecord = (): PostDatabaseSchema => {
  return cloneDeep({
    id: sampleStoryId,
    title: 'test story',
    visibility: VisibilityEnum.Public,
    postType: EntityTypeEnum.Story,
    createdById: sampleUserId,
    createdAt,
    updatedAt
  })
}

export const storyDatabaseRecord = (): StoryDatabaseSchema => {
  return cloneDeep({
    id: storyDTOMock().id,
    postType: 'story',
    visibility: VisibilityEnum.Public,
    createdById: sampleUserId,
    coverImageId: imageAttacmentMock().id,
    createdAt: storyDTOMock().createdAt,
    updatedAt: storyDTOMock().updatedAt,
    title: storyDTOMock().title,
    body: storyDTOMock().body,
    tagIds: [],
    commentIds: []
  })
}

export const storyReadDatabaseRecord = (): StoryReadDatabaseSchema => {
  return cloneDeep({
    ...storyDatabaseRecord(),
    createdByName: sampleUserName,
    coverImageId: imageAttacmentMock().id
  })
}

export const storyDTOMock = () => {
  return cloneDeep({
    id: sampleStoryId,
    visibility: VisibilityEnum.Public,
    createdById: sampleUserId,
    createdAt,
    updatedAt,
    title: 'test story',
    body: 'A test story.',
    coverImageId: imageAttacmentMock().id,
    tagIds: []
  })
}

export const storyResponseMock = (): StoryResponse => {
  return cloneDeep({
    id: sampleStoryId,
    visibility: VisibilityEnum.Public,
    createdById: sampleUserId,
    createdAt,
    updatedAt,
    title: 'test story',
    body: 'A test story.',
    coverImageId: imageAttacmentMock().id,
    tagIds: []
  })
}

export const storyReadModelDTOMock = (overrides: Partial<StoryReadModelDTO> = {}): StoryReadModelDTO => {
  return cloneDeep({
    id: sampleStoryId,
    visibility: storyDTOMock().visibility,
    title: storyDTOMock().title,
    body: storyDTOMock().body,
    coverImageId: storyDTOMock().coverImageId,
    createdByName: sampleUserName,
    createdById: storyDTOMock().createdById,
    tagIds: [],
    commentIds: [],
    createdAt,
    updatedAt,
    ...overrides
  })
}

export const storyPropsMock = (overrides: Partial<StoryProps> = {}): StoryProps => {
  return {
    id: overrides.id ? overrides.id : new PostId(storyDTOMock().id),
    visibility: overrides.visibility ? overrides.visibility : new PostVisibility(storyDTOMock().visibility),
    createdById: overrides.createdById ? overrides.createdById : new PostCreatorId(storyDTOMock().createdById),
    createdAt: overrides.createdAt ? overrides.createdAt : new CreatedAtTimestamp(storyDTOMock().createdAt),
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(storyDTOMock().updatedAt),
    body: overrides.body ? overrides.body : new NonEmptyString(storyDTOMock().body),
    coverImageId: overrides.coverImageId
      ? overrides.coverImageId
      : storyDTOMock().coverImageId
        ? new CoverImageId(storyDTOMock().coverImageId)
        : CoverImageId.NOT_SET,
    tagIds: overrides.tagIds ? overrides.tagIds : storyDTOMock().tagIds.map((id) => new TagId(id)),
    title: overrides.title ? overrides.title : new NonEmptyString(storyDTOMock().title)
  }
}

export const recipeDTOMock = () => {
  return cloneDeep({
    id: sampleRecipeId,
    visibility: VisibilityEnum.Public,
    createdById: sampleUserId,
    createdByName: sampleUserName,
    createdAt,
    updatedAt,
    title: 'test recipe',
    description: 'A test recipe.',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['instruction1', 'instruction2']
  })
}

export const recipeMock = (overrides: Partial<RecipeProps> = {}): Recipe => {
  return Recipe.reconstruct({
    id: overrides.id ? overrides.id : new PostId(recipeDTOMock().id),
    createdById: overrides.createdById ? overrides.createdById : new PostCreatorId(recipeDTOMock().createdById),
    title: overrides.title ? overrides.title : new NonEmptyString(recipeDTOMock().title),
    visibility: overrides.visibility ? overrides.visibility : new PostVisibility(recipeDTOMock().visibility),
    description: overrides.description ? overrides.description : recipeDTOMock().description,
    ingredients: overrides.ingredients ? overrides.ingredients : recipeDTOMock().ingredients,
    instructions: overrides.instructions ? overrides.instructions : recipeDTOMock().instructions,
    createdAt: overrides.createdAt ? overrides.createdAt : new CreatedAtTimestamp(recipeDTOMock().createdAt),
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(recipeDTOMock().updatedAt)
  })
}

export const storyMock = (overrides: Partial<StoryProps> = {}): Story => {
  const story = Story.reconstruct({
    id: overrides.id ? overrides.id : new PostId(storyDTOMock().id),
    createdById: overrides.createdById ? overrides.createdById : new PostCreatorId(storyDTOMock().createdById),
    title: overrides.title ? overrides.title : new NonEmptyString(storyDTOMock().title),
    visibility: overrides.visibility ? overrides.visibility : new PostVisibility(storyDTOMock().visibility),
    body: overrides.body ? overrides.body : new NonEmptyString(storyDTOMock().body),
    coverImageId: overrides.coverImageId
      ? overrides.coverImageId
      : storyDTOMock().coverImageId
        ? new CoverImageId(storyDTOMock().coverImageId)
        : CoverImageId.NOT_SET,
    tagIds: overrides.tagIds ? overrides.tagIds : storyDTOMock().tagIds.map((id) => new TagId(id)),
    createdAt: overrides.createdAt ? overrides.createdAt : new CreatedAtTimestamp(storyDTOMock().createdAt),
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(storyDTOMock().updatedAt)
  })

  return story
}

export const imageAttacmentMock = (overrides: Partial<ImageAttachmentReadModelDTO> = {}): ImageAttachmentReadModelDTO => {
  return cloneDeep({
    id: sampleImageId,
    storageKey: 'filename.png',
    mimeType: 'image/png',
    size: 1537565,
    ownerEntityId: sampleStoryId,
    ownerEntityType: EntityTypeEnum.Story,
    createdById: sampleUserId,
    createdByName: sampleUserName,
    base64: 'data:image/png;base64,iVBORw0KGgo',
    createdAt,
    updatedAt,
    ...overrides
  })
}

export const userReadModelDTOMock = (overrides: Partial<UserReadModelDTO> = {}): UserReadModelDTO => {
  return cloneDeep({
    id: sampleUserId,
    name: 'Test User',
    email: 'test.user@example.com',
    roles: [UserRoleEnum.Admin],
    active: true,
    createdAt: createdAt,
    updatedAt: updatedAt,
    ...overrides
  })
}

export const tagDTOMock = (): TagDTO => {
  return {
    id: sampleTagId,
    name: 'test tag',
    slug: 'test-tag',
    createdById: sampleUserId,
    createdAt,
    updatedAt
  }
}

export const tagMock = (): Tag => {
  return Tag.reconstruct({
    id: new TagId(tagDTOMock().id),
    slug: new TagSlug(tagDTOMock().slug),
    name: new NonEmptyString(tagDTOMock().name),
    createdById: new TagCreatorId(tagDTOMock().createdById),
    createdAt: new CreatedAtTimestamp(tagDTOMock().createdAt),
    updatedAt: new UnixTimestamp(tagDTOMock().updatedAt)
  })
}

export const mediaGatewayMock = (): Mocked<IMediaGateway> => {
  class MediaGatewayMock implements IMediaGateway {
    getImageById = vi.fn().mockResolvedValue(EntityLoadResult.success(imageAttacmentMock()))
    prepareStagedImageFile = vi.fn().mockResolvedValue({
      imageId: 'test1b19-image-staged-a2f0-f95ccab82d92',
      stagedVersionId: 'test1b19-staged-version-4792-a2f0-f95ccab82d92',
      storageKey: 'staged_story_cover_test.webp',
      mimeType: 'image/webp',
      size: 100,
      createdById: 'test-user-id'
    })
    registerPreparedStagedImageFileRollbackCleanup = vi.fn().mockResolvedValue(void 0)
    saveStagedImageMetadata = vi.fn().mockResolvedValue(void 0)
    createStagedImageVersion = vi.fn().mockResolvedValue({
      imageId: 'test1b19-image-staged-a2f0-f95ccab82d92',
      stagedVersionId: 'test1b19-staged-version-4792-a2f0-f95ccab82d92'
    })
    promoteImageVersion = vi.fn().mockResolvedValue(void 0)
    deleteImage = vi.fn().mockResolvedValue(void 0)
  }
  return new MediaGatewayMock()
}

export const storyCoverImageCleanupServiceMock = (): Mocked<IStoryCoverImageCleanupService> => {
  class StoryCoverImageCleanupServiceMock implements IStoryCoverImageCleanupService {
    deleteCoverImageIfUnreferenced = vi.fn().mockResolvedValue(void 0)
  }
  return new StoryCoverImageCleanupServiceMock()
}

export const userGatewayMock = (): Mocked<IUserGateway> => {
  class UserGatewayMock implements IUserGateway {
    getUserById = vi.fn().mockResolvedValue(EntityLoadResult.success(userReadModelDTOMock()))
  }
  return new UserGatewayMock()
}

export const postWriteRepositoryMock = (): Mocked<IPostWriteRepository & ITransactionAware> => {
  class PostWriteRepositoryMock implements IPostWriteRepository {
    findByIdForUpdate = vi.fn().mockResolvedValue(postDatabaseRecord())
    insert = vi.fn().mockResolvedValue(postDatabaseRecord())
    update = vi.fn().mockResolvedValue(postDatabaseRecord())
    deleteById = vi.fn().mockResolvedValue(1)
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('posts')
  }
  return new PostWriteRepositoryMock()
}

export const storyReadRepositoryMock = (): Mocked<IStoryReadRepository & ITransactionAware> => {
  class StoryReadRepositoryMock implements IStoryReadRepository {
    count = vi.fn().mockResolvedValue(1)
    search = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findAll = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findAllPublic = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findById = vi.fn().mockResolvedValue(storyReadModelDTOMock())
    findByIds = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findByImageId = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findAllReferencedCoverImageIds = vi.fn().mockResolvedValue([])
    findAllVisibleForLoggedInCreator = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findAllForCreator = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findLatest = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findStoriesOfCreatorByName = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    countAll = vi.fn().mockResolvedValue(1)
    countStoriesByCreator = vi.fn().mockResolvedValue(1)
    invalidateById = vi.fn()
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('stories')
  }
  return new StoryReadRepositoryMock()
}

export const storyWriteRepositoryMock = (): Mocked<IStoryWriteRepository & ITransactionAware> => {
  class StoryWriteRepositoryMock implements IStoryWriteRepository {
    insert = vi.fn().mockResolvedValue(storyMock())
    update = vi.fn().mockResolvedValue(storyMock())
    findByIdForUpdate = vi.fn().mockResolvedValue(storyMock())
    delete = vi.fn().mockResolvedValue(storyMock())
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('stories')
  }
  return new StoryWriteRepositoryMock()
}

export const storyLookupServiceMock = (): Mocked<IStoryLookupService> => {
  class StoryLookupServiceMock implements IStoryLookupService {
    count = vi.fn().mockResolvedValue(1)
    search = vi.fn().mockResolvedValue([storyMock()])
    findAll = vi.fn().mockResolvedValue([storyMock()])
    findAllPublic = vi.fn().mockResolvedValue([storyMock()])
    findById = vi.fn().mockResolvedValue(storyMock())
    findByIds = vi.fn().mockResolvedValue([storyMock()])
    findByImageId = vi.fn().mockResolvedValue([storyMock()])
    findAllVisibleForLoggedInCreator = vi.fn().mockResolvedValue([storyMock()])
    findAllForCreator = vi.fn().mockResolvedValue([storyMock()])
    findLatest = vi.fn().mockResolvedValue([storyMock()])
    findStoriesOfCreatorByName = vi.fn().mockResolvedValue([storyMock()])
    invalidateById = vi.fn()
    countAll = vi.fn().mockResolvedValue(1)
    countStoriesByCreator = vi.fn().mockResolvedValue(1)
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new StoryLookupServiceMock()
}

export const storyListSearchServiceMock = (): Mocked<IStoryListSearchService> => {
  class StoryListSearchServiceMock implements IStoryListSearchService {
    search = vi.fn().mockResolvedValue({ stories: [storyMock()], totalCount: 1 })
  }
  return new StoryListSearchServiceMock()
}

export const postDTOMock = (overrides: Partial<PostDTO> = {}): PostDTO => {
  return cloneDeep({
    id: sampleStoryId,
    visibility: VisibilityEnum.Public,
    title: 'test story',
    postType: EntityTypeEnum.Story,
    createdById: sampleUserId,
    createdAt,
    updatedAt,
    ...overrides
  })
}

export const commentDTOMock = (overrides: Partial<CommentDTO> = {}): CommentDTO => {
  return cloneDeep({
    id: sampleCommentId,
    postId: sampleStoryId,
    authorId: sampleUserId,
    body: 'A test comment.',
    parentCommentId: null,
    isDeleted: false,
    createdAt,
    updatedAt,
    ...overrides
  })
}

export const commentReadModelDTOMock = (overrides: Partial<CommentReadModelDTO> = {}): CommentReadModelDTO => {
  return cloneDeep({
    id: sampleCommentId,
    postId: sampleStoryId,
    authorId: sampleUserId,
    body: commentDTOMock().body,
    parentCommentId: null,
    isDeleted: false,
    createdAt,
    updatedAt,
    replyCount: 0,
    hasReplies: false,
    repliesPreview: { replies: [], nextCursor: null },
    ...overrides
  })
}

export const commentWithRelationsDTOMock = (overrides: Partial<CommentWithRelationsDTO> = {}): CommentWithRelationsDTO => {
  return cloneDeep({
    id: sampleCommentId,
    postId: sampleStoryId,
    authorId: sampleUserId,
    authorName: sampleUserName,
    body: commentDTOMock().body,
    parentCommentId: null,
    isDeleted: false,
    createdAt,
    updatedAt,
    replyCount: 0,
    hasReplies: false,
    repliesPreview: { replies: [], nextCursor: null },
    nextCursor: null,
    ...overrides
  })
}

export const commentListChunkDTOMock = (overrides: Partial<CommentListChunkDTO> = {}): CommentListChunkDTO => {
  return cloneDeep({
    comments: [commentWithRelationsDTOMock()],
    nextCursor: null,
    ...overrides
  })
}

export const repliesPreviewDTOMock = (overrides: Partial<RepliesPreviewDTO> = {}): RepliesPreviewDTO => {
  return cloneDeep({
    replies: [],
    nextCursor: null,
    ...overrides
  })
}

export const commentDatabaseRecord = (): CommentDatabaseSchema => {
  return cloneDeep({
    id: commentDTOMock().id,
    postId: commentDTOMock().postId,
    authorId: commentDTOMock().authorId,
    body: commentDTOMock().body!,
    parentCommentId: commentDTOMock().parentCommentId,
    isDeleted: commentDTOMock().isDeleted,
    replyCount: 0,
    hasReplies: false,
    createdAt: commentDTOMock().createdAt,
    updatedAt: commentDTOMock().updatedAt
  })
}

export const commentPropsMock = (overrides: Partial<CommentProps> = {}): CommentProps => {
  const dto = commentDTOMock()
  return {
    id: overrides.id ?? new CommentId(dto.id),
    postId: overrides.postId ?? new PostId(dto.postId),
    authorId: overrides.authorId ?? new CommentAuthorId(dto.authorId),
    body: overrides.body !== undefined ? overrides.body : dto.body ? new NonEmptyString(dto.body) : null,
    parentCommentId: overrides.parentCommentId !== undefined ? overrides.parentCommentId : CommentId.fromOptional(dto.parentCommentId),
    isDeleted: overrides.isDeleted ?? dto.isDeleted,
    createdAt: overrides.createdAt ?? new CreatedAtTimestamp(dto.createdAt),
    updatedAt: overrides.updatedAt ?? new UnixTimestamp(dto.updatedAt)
  }
}

export const commentMock = (overrides: Partial<CommentProps> = {}): Comment => {
  return Comment.reconstruct(commentPropsMock(overrides))
}

export const commentWriteRepositoryMock = (): Mocked<ICommentWriteRepository & ITransactionAware> => {
  class CommentWriteRepositoryMock implements ICommentWriteRepository {
    findByIdForUpdate = vi.fn().mockResolvedValue(commentMock())
    insert = vi.fn().mockResolvedValue(commentMock())
    update = vi.fn().mockResolvedValue(commentMock())
    softDelete = vi.fn().mockResolvedValue(undefined)
    deletePermanently = vi.fn().mockResolvedValue(undefined)
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('comments')
  }
  return new CommentWriteRepositoryMock()
}

export const commentReadRepositoryMock = (): Mocked<ICommentReadRepository & ITransactionAware> => {
  class CommentReadRepositoryMock implements ICommentReadRepository {
    getById = vi.fn().mockResolvedValue(commentReadModelDTOMock())
    listTopLevelForPost = vi.fn().mockResolvedValue({ comments: [commentReadModelDTOMock()], nextCursor: null })
    listReplies = vi.fn().mockResolvedValue({ replies: [], nextCursor: null })
    countForPost = vi.fn().mockResolvedValue(1)
    countReplies = vi.fn().mockResolvedValue(0)
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('comments')
  }
  return new CommentReadRepositoryMock()
}

export const commentLookupServiceMock = (): Mocked<ICommentLookupService> => {
  class CommentLookupServiceMock implements ICommentLookupService {
    getById = vi.fn().mockResolvedValue(commentWithRelationsDTOMock())
    listTopLevelForPost = vi.fn().mockResolvedValue(commentListChunkDTOMock())
    listReplies = vi.fn().mockResolvedValue(repliesPreviewDTOMock())
    countForPost = vi.fn().mockResolvedValue(1)
    countReplies = vi.fn().mockResolvedValue(0)
  }
  return new CommentLookupServiceMock()
}

export const postReadRepositoryMock = (): Mocked<IPostReadRepository & ITransactionAware> => {
  class PostReadRepositoryMock implements IPostReadRepository {
    findById = vi.fn().mockResolvedValue(postDTOMock())
    search = vi.fn().mockResolvedValue({ posts: [postDTOMock()], totalCount: 1 })
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('posts')
  }
  return new PostReadRepositoryMock()
}

export const tagRepositoryMock = (): Mocked<ITagRepository & ITransactionAware> => {
  class TagRepositoryMock implements ITagRepository {
    findById = vi.fn().mockResolvedValue(tagMock())
    findByIds = vi.fn().mockResolvedValue([tagMock()])
    findAll = vi.fn().mockResolvedValue([tagMock()])
    insert = vi.fn().mockResolvedValue(tagMock())
    insertMany = vi.fn().mockResolvedValue([tagMock()])
    update = vi.fn().mockResolvedValue(tagMock())
    delete = vi.fn()
    deleteMany = vi.fn()
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
    getTableName = vi.fn().mockReturnValue('tags')
  }
  return new TagRepositoryMock()
}

export const resolveStoryTagIdsServiceMock = (): Mocked<IResolveStoryTagIdsService> => {
  class ResolveStoryTagIdsServiceMock implements IResolveStoryTagIdsService {
    resolve = vi.fn().mockResolvedValue([tagMock().id.value])
  }
  return new ResolveStoryTagIdsServiceMock()
}

export const domainEventDispatcherMock = (): Mocked<IDomainEventDispatcher> => {
  return {
    register: vi.fn(),
    dispatch: vi.fn()
  }
}

export const domainEventServiceMock = (): Mocked<IDomainEventService> => {
  class DomainEventServiceMock implements IDomainEventService {
    persistToOutbox = vi.fn()
  }
  return new DomainEventServiceMock()
}

export const unitOfWorkMock = (domainEventServiceMock: Mocked<IDomainEventService>): IUnitOfWork<PostId, UnixTimestamp> => {
  class UnitOfWorkMock implements IUnitOfWork<PostId, UnixTimestamp> {
    execute = async <T extends Array<IDomainEventHolder<PostId, UnixTimestamp> | null>>(work: () => Promise<[...T]>): Promise<[...T]> => {
      const domainEventHolders = await work()

      for (const eventHolder of domainEventHolders) {
        if (eventHolder) {
          // loop through all domain events one by one for testing convenience, despite persistToOutbox expecting an array of events
          for (const event of eventHolder.domainEvents) {
            await domainEventServiceMock.persistToOutbox([event])
          }
        }
      }
      domainEventHolders.forEach((eventHolder) => eventHolder && eventHolder.clearEvents())

      return domainEventHolders
    }
  }

  return new UnitOfWorkMock()
}

export const storyAuthorizationServiceMock = (): Mocked<IStoryAuthorizationService> => {
  class StoryAuthorizationServiceMock implements IStoryAuthorizationService {
    canCreateStory = vi.fn().mockReturnValue({ allowed: true })
    canUpdateStory = vi.fn().mockReturnValue({ allowed: true })
    canDeleteStory = vi.fn().mockReturnValue({ allowed: true })
    canViewStory = vi.fn().mockReturnValue({ allowed: true })
    canSearchStories = vi.fn().mockReturnValue({ allowed: true })
  }
  return new StoryAuthorizationServiceMock()
}

export const commentAuthorizationServiceMock = (): Mocked<ICommentAuthorizationService> => {
  class CommentAuthorizationServiceMock implements ICommentAuthorizationService {
    canAddComment = vi.fn().mockReturnValue({ allowed: true })
    canAddReply = vi.fn().mockReturnValue({ allowed: true })
    canEditComment = vi.fn().mockReturnValue({ allowed: true })
    canSoftDeleteComment = vi.fn().mockReturnValue({ allowed: true })
    canHardDeleteComment = vi.fn().mockReturnValue({ allowed: true })
  }

  return new CommentAuthorizationServiceMock()
}

export const searchStoriesRequest = (): SearchStoriesRequest => {
  return cloneDeep({
    storiesPerPage: 50,
    pageNumber: 1,
    onlyMyStories: false,
    order: 'asc',
    orderBy: 'visibility',
    search: 'search string',
    visibility: ['logged_in', 'private'],
    hasImage: false
  })
}

export const searchPostsRequest = (): SearchPostsRequest => {
  return cloneDeep({
    postsPerPage: 50,
    pageNumber: 1,
    order: 'asc',
    orderBy: 'visibility',
    search: 'search string',
    visibility: ['logged_in', 'private']
  })
}

export const createStoryRequest = (): CreateStoryRequest => {
  return cloneDeep({
    id: 'not ok id', // should not be able to give this
    visibility: VisibilityEnum.Public,
    title: storyDTOMock().title,
    body: storyDTOMock().body,
    image: {
      mimeType: 'image/png',
      size: 1537565,
      base64: 'data:image/png;base64,iVBORw0KGgo'
    },
    createdById: sampleUserId, // should not be able to give this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }), // should not be able to give this,
    tags: []
  })
}

export const updateStoryRequest = (): UpdateStoryRequest => {
  return cloneDeep({
    id: storyDTOMock().id,
    visibility: VisibilityEnum.Private,
    image: {
      mimeType: 'image/png',
      size: 1537565,
      base64: 'data:image/png;base64,iVBORw0KGgo'
    },
    title: 'test story title changed',
    body: 'A test story with a new body.',
    createdById: sampleUserId, // should not be able to change this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }), // should not be able to change this,
    tags: []
  })
}
