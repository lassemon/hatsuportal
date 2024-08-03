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
import { UserLoadResult } from '../application/acl/userManagement/outcomes/UserLoadResult'
import { IUserGateway } from '../application/acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../application/dtos/user/UserReadModelDTO'
import { EntityTypeEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { IDomainEventDispatcher, IDomainEventHolder, NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { cloneDeep } from 'lodash'
import { CoverImageId } from '../domain/valueObjects/CoverImageId'
import { IMediaGateway } from '../application/acl/mediaManagement/IMediaGateway'
import { ImageLoadResult } from '../application/acl/mediaManagement/outcomes/ImageLoadResult'
import { ImageAttachmentReadModelDTO } from '../application/dtos/image/ImageAttachmentReadModelDTO'
import { IStoryLookupService } from '../application/services/story/StoryLookupService'
import { TagDTO } from '../application/dtos/post/TagDTO'
import { TagCreatorId } from '../domain/valueObjects/TagCreatorId'
import { PostDatabaseSchema } from '../infrastructure/schemas/PostDatabaseSchema'
import { IPostAuthorizationService } from '../application/authorization/services/PostAuthorizationService'
import { IStoryReadRepository, StoryReadModelDTO } from '../application'
import { IPostWriteRepository } from '../infrastructure'
import { ITransactionAware, ITransactionManager } from '@hatsuportal/platform'
import { CreateStoryRequest, SearchStoriesRequest, UpdateStoryRequest } from '@hatsuportal/contracts'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const sampleUserId = 'test1b19-user-4792-a2f0-f95ccab82d92'
export const sampleUserName = 'testUserName'
export const sampleStoryId = 'test1b19-story-4792-a2f0-f95ccab82d92'
export const sampleRecipeId = 'test1b19-recipe-4792-a2f0-f95ccab82d92'
export const sampleImageId = 'test1b19-image-4792-a2f0-f95ccab82d92'
export const sampleTagId = 'test1b19-tag-4792-a2f0-f95ccab82d92-a2f0-f95cc2met'

// for detecting instance of
export class TestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const postDatabaseRecord = (): PostDatabaseSchema => {
  return cloneDeep({
    id: sampleStoryId,
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
    name: storyDTOMock().name,
    description: storyDTOMock().description,
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
    name: 'test story',
    description: 'A test story.',
    coverImageId: imageAttacmentMock().id,
    tagIds: []
  })
}

export const storyReadModelDTOMock = (overrides: Partial<StoryReadModelDTO> = {}): StoryReadModelDTO => {
  return cloneDeep({
    id: sampleStoryId,
    visibility: storyDTOMock().visibility,
    name: storyDTOMock().name,
    description: storyDTOMock().description,
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
    createdAt: overrides.createdAt ? overrides.createdAt : new UnixTimestamp(storyDTOMock().createdAt),
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(storyDTOMock().updatedAt),
    description: overrides.description ? overrides.description : new NonEmptyString(storyDTOMock().description),
    coverImageId: overrides.coverImageId
      ? overrides.coverImageId
      : storyDTOMock().coverImageId
        ? new CoverImageId(storyDTOMock().coverImageId)
        : null,
    tagIds: overrides.tagIds ? overrides.tagIds : storyDTOMock().tagIds.map((id) => new TagId(id)),
    name: overrides.name ? overrides.name : new NonEmptyString(storyDTOMock().name)
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
    name: 'test recipe',
    description: 'A test recipe.',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: ['instruction1', 'instruction2']
  })
}

export const recipeMock = (overrides: Partial<RecipeProps> = {}): Recipe => {
  return Recipe.reconstruct({
    id: overrides.id ? overrides.id : new PostId(recipeDTOMock().id),
    createdById: overrides.createdById ? overrides.createdById : new PostCreatorId(recipeDTOMock().createdById),
    name: overrides.name ? overrides.name : new NonEmptyString(recipeDTOMock().name),
    description: overrides.description ? overrides.description : recipeDTOMock().description,
    ingredients: overrides.ingredients ? overrides.ingredients : recipeDTOMock().ingredients,
    instructions: overrides.instructions ? overrides.instructions : recipeDTOMock().instructions,
    createdAt: overrides.createdAt ? overrides.createdAt : new UnixTimestamp(recipeDTOMock().createdAt),
    updatedAt: overrides.updatedAt ? overrides.updatedAt : new UnixTimestamp(recipeDTOMock().updatedAt)
  })
}

export const storyMock = (overrides: Partial<StoryProps> = {}): Story => {
  const story = Story.reconstruct({
    id: overrides.id ? overrides.id : new PostId(storyDTOMock().id),
    createdById: overrides.createdById ? overrides.createdById : new PostCreatorId(storyDTOMock().createdById),
    name: overrides.name ? overrides.name : new NonEmptyString(storyDTOMock().name),
    visibility: overrides.visibility ? overrides.visibility : new PostVisibility(storyDTOMock().visibility),
    description: overrides.description ? overrides.description : new NonEmptyString(storyDTOMock().description),
    coverImageId: overrides.coverImageId
      ? overrides.coverImageId
      : storyDTOMock().coverImageId
        ? new CoverImageId(storyDTOMock().coverImageId)
        : null,
    tagIds: overrides.tagIds ? overrides.tagIds : storyDTOMock().tagIds.map((id) => new TagId(id)),
    createdAt: overrides.createdAt ? overrides.createdAt : new UnixTimestamp(storyDTOMock().createdAt),
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
    createdAt: new UnixTimestamp(tagDTOMock().createdAt),
    updatedAt: new UnixTimestamp(tagDTOMock().updatedAt)
  })
}

export const mediaGatewayMock = (): Mocked<IMediaGateway> => {
  class MediaGatewayMock implements IMediaGateway {
    getImageById = vi.fn().mockResolvedValue(ImageLoadResult.success(imageAttacmentMock()))
    createStagedImageVersion = vi.fn().mockResolvedValue({
      imageId: 'test1b19-image-staged-a2f0-f95ccab82d92',
      stagedVersionId: 'test1b19-staged-version-4792-a2f0-f95ccab82d92'
    })
    promoteImageVersion = vi.fn().mockResolvedValue(void 0)
    discardImageVersion = vi.fn().mockResolvedValue(void 0)
    updateImage = vi.fn().mockResolvedValue(imageAttacmentMock())
    deleteImage = vi.fn().mockResolvedValue(void 0)
  }
  return new MediaGatewayMock()
}

export const userGatewayMock = (): Mocked<IUserGateway> => {
  class UserGatewayMock implements IUserGateway {
    getUserById = vi.fn().mockResolvedValue(UserLoadResult.success(userReadModelDTOMock()))
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
    findAllPublic = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findById = vi.fn().mockResolvedValue(storyReadModelDTOMock())
    findByImageId = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findAllVisibleForLoggedInCreator = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findAllForCreator = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findLatest = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    findStoriesOfCreatorByName = vi.fn().mockResolvedValue([storyReadModelDTOMock()])
    countAll = vi.fn().mockResolvedValue(1)
    countStoriesByCreator = vi.fn().mockResolvedValue(1)
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
    findAllPublic = vi.fn().mockResolvedValue([storyMock()])
    findById = vi.fn().mockResolvedValue(storyMock())
    findByImageId = vi.fn().mockResolvedValue([storyMock()])
    findAllVisibleForLoggedInCreator = vi.fn().mockResolvedValue([storyMock()])
    findAllForCreator = vi.fn().mockResolvedValue([storyMock()])
    findLatest = vi.fn().mockResolvedValue([storyMock()])
    findStoriesOfCreatorByName = vi.fn().mockResolvedValue([storyMock()])
    countAll = vi.fn().mockResolvedValue(1)
    countStoriesByCreator = vi.fn().mockResolvedValue(1)
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new StoryLookupServiceMock()
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

export const domainEventDispatcherMock = (): Mocked<IDomainEventDispatcher> => {
  return {
    register: vi.fn(),
    dispatch: vi.fn()
  }
}

export const transactionManagerMock = (domainEventDispatcherMock: Mocked<IDomainEventDispatcher>): ITransactionManager<PostId> => {
  class TransactionManagerMock implements ITransactionManager<PostId> {
    execute = async <T extends Array<IDomainEventHolder<PostId> | null>>(
      work: () => Promise<[...T]>,
      repositories?: ITransactionAware[]
    ): Promise<[...T]> => {
      const domainEventHolders = await work()

      for (const eventHolder of domainEventHolders) {
        if (eventHolder) {
          for (const event of eventHolder.domainEvents) {
            await domainEventDispatcherMock.dispatch(event)
          }
        }
      }
      domainEventHolders.forEach((eventHolder) => eventHolder && eventHolder.clearEvents())

      return domainEventHolders
    }
  }

  return new TransactionManagerMock()
}

export const postAuthorizationServiceMock = (): Mocked<IPostAuthorizationService> => {
  class PostAuthorizationServiceMock implements IPostAuthorizationService {
    canCreateStory = vi.fn().mockReturnValue({ allowed: true })
    canUpdateStory = vi.fn().mockReturnValue({ allowed: true })
    canDeleteStory = vi.fn().mockReturnValue({ allowed: true })
    canRemoveImageFromStory = vi.fn().mockReturnValue({ allowed: true })
    canViewStory = vi.fn().mockReturnValue({ allowed: true })
    canSearchStories = vi.fn().mockReturnValue({ allowed: true })
    canAddComment = vi.fn().mockReturnValue({ allowed: true })
    canAddReply = vi.fn().mockReturnValue({ allowed: true })
    canEditComment = vi.fn().mockReturnValue({ allowed: true })
    canSoftDeleteComment = vi.fn().mockReturnValue({ allowed: true })
    canHardDeleteComment = vi.fn().mockReturnValue({ allowed: true })
  }
  return new PostAuthorizationServiceMock()
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

export const createStoryRequest = (): CreateStoryRequest => {
  return cloneDeep({
    id: 'not ok id', // should not be able to give this
    visibility: VisibilityEnum.Public,
    name: storyDTOMock().name,
    description: storyDTOMock().description,
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
    name: 'test story name changed',
    description: 'A test story with a new description.',
    createdById: sampleUserId, // should not be able to change this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }), // should not be able to change this,
    tags: []
  })
}
