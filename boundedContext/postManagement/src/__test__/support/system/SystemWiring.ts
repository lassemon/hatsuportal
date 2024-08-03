import { TTLCache } from '@hatsuportal/platform'
import { AbacEngine, UserToRequesterMapper } from '@hatsuportal/platform'
import { OrderEnum } from '@hatsuportal/common'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { Tag } from '../../../domain'
import { CommentReadModelDTO, StoryReadModelDTO } from '../../../application'
import { AddCommentUseCase } from '../../../application/useCases/comment/AddCommentUseCase/AddCommentUseCase'
import { AddCommentUseCaseWithValidation } from '../../../application/useCases/comment/AddCommentUseCase/AddCommentUseCaseWithValidation'
import { EditCommentUseCase } from '../../../application/useCases/comment/EditCommentUseCase/EditCommentUseCase'
import { EditCommentUseCaseWithValidation } from '../../../application/useCases/comment/EditCommentUseCase/EditCommentUseCaseWithValidation'
import { GetCommentsUseCase } from '../../../application/useCases/comment/GetCommentsUseCase/GetCommentsUseCase'
import { GetCommentsUseCaseWithValidation } from '../../../application/useCases/comment/GetCommentsUseCase/GetCommentsUseCaseWithValidation'
import { GetRepliesUseCase } from '../../../application/useCases/comment/GetRepliesUseCase/GetRepliesUseCase'
import { GetRepliesUseCaseWithValidation } from '../../../application/useCases/comment/GetRepliesUseCase/GetRepliesUseCaseWithValidation'
import { HardDeleteCommentUseCase } from '../../../application/useCases/comment/HardDeleteCommentUseCase/HardDeleteCommentUseCase'
import { HardDeleteCommentUseCaseWithValidation } from '../../../application/useCases/comment/HardDeleteCommentUseCase/HardDeleteCommentUseCaseWithValidation'
import { SoftDeleteCommentUseCase } from '../../../application/useCases/comment/SoftDeleteCommentUseCase/SoftDeleteCommentUseCase'
import { SoftDeleteCommentUseCaseWithValidation } from '../../../application/useCases/comment/SoftDeleteCommentUseCase/SoftDeleteCommentUseCaseWithValidation'
import { SearchPostsUseCase } from '../../../application/useCases/post/SearchPostsUseCase/SearchPostsUseCase'
import { SearchPostsUseCaseWithValidation } from '../../../application/useCases/post/SearchPostsUseCase/SearchPostsUseCaseWithValidation'
import { CreateStoryUseCase } from '../../../application/useCases/story/CreateStoryUseCase/CreateStoryUseCase'
import { CreateStoryUseCaseWithValidation } from '../../../application/useCases/story/CreateStoryUseCase/CreateStoryUseCaseWithValidation'
import { DeleteStoryUseCase } from '../../../application/useCases/story/DeleteStoryUseCase/DeleteStoryUseCase'
import { DeleteStoryUseCaseWithValidation } from '../../../application/useCases/story/DeleteStoryUseCase/DeleteStoryUseCaseWithValidation'
import { FindMyStoriesUseCase } from '../../../application/useCases/story/FindMyStoriesUseCase/FindMyStoriesUseCase'
import { FindMyStoriesUseCaseWithValidation } from '../../../application/useCases/story/FindMyStoriesUseCase/FindMyStoriesUseCaseWithValidation'
import { FindStoryUseCase } from '../../../application/useCases/story/FindStoryUseCase/FindStoryUseCase'
import { FindStoryUseCaseWithValidation } from '../../../application/useCases/story/FindStoryUseCase/FindStoryUseCaseWithValidation'
import { SearchStoriesUseCase } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'
import { SearchStoriesUseCaseWithValidation } from '../../../application/useCases/story/SearchStoriesUseCase/SearchStoriesUseCaseWithValidation'
import { UpdateStoryUseCase } from '../../../application/useCases/story/UpdateStoryUseCase/UpdateStoryUseCase'
import { UpdateStoryUseCaseWithValidation } from '../../../application/useCases/story/UpdateStoryUseCase/UpdateStoryUseCaseWithValidation'
import { FindAllTagsUseCase } from '../../../application/useCases/tag/FindAllTagsUseCase/FindAllTagsUseCase'
import { PostApplicationMapper } from '../../../application/mappers/PostApplicationMapper'
import { StoryApplicationMapper } from '../../../application/mappers/StoryApplicationMapper'
import { TagApplicationMapper } from '../../../application/mappers/TagApplicationMapper'
import { CommentAuthorizationService } from '../../../application/authorization/services/CommentAuthorizationService'
import { StoryAuthorizationService } from '../../../application/authorization/services/StoryAuthorizationService'
import {
  CommentAction,
  CommentAuthorizationPayloadMap,
  commentRuleMap,
  commentRequestBuilderMap
} from '../../../application/authorization/rules/comment.rules'
import {
  StoryAction,
  StoryAuthorizationPayloadMap,
  storyRuleMap,
  storyRequestBuilderMap
} from '../../../application/authorization/rules/story.rules'
import { CommentLookupService } from '../../../application/services/comment/CommentLookupService'
import { ResolveStoryTagIdsService } from '../../../application/services/tag/ResolveStoryTagIdsService'
import { StoryCoverImageCleanupService } from '../../../application/services/story/StoryCoverImageCleanupService'
import { StoryListSearchService } from '../../../application/services/story/StoryListSearchService'
import { StoryLookupService } from '../../../application/services/story/StoryLookupService'
import { CommentInfrastructureMapper } from '../../../infrastructure/mappers/CommentInfrastructureMapper'
import { PostInfrastructureMapper } from '../../../infrastructure/mappers/PostInfrastructureMapper'
import { StoryInfrastructureMapper } from '../../../infrastructure/mappers/StoryInfrastructureMapper'
import { TagInfrastructureMapper } from '../../../infrastructure/mappers/TagInfrastructureMapper'
import { CommentReadRepository } from '../../../infrastructure/repositories/CommentReadRepository'
import { CommentReadRepositoryWithCache } from '../../../infrastructure/repositories/CommentReadRepositoryWithCache'
import { CommentWriteRepository } from '../../../infrastructure/repositories/CommentWriteRepository'
import { PostReadRepository } from '../../../infrastructure/repositories/PostReadRepository'
import { PostWriteRepository } from '../../../infrastructure/repositories/PostWriteRepository'
import { StoryReadRepository } from '../../../infrastructure/repositories/StoryReadRepository'
import { StoryReadRepositoryWithCache } from '../../../infrastructure/repositories/StoryReadRepositoryWithCache'
import { StoryWriteRepository } from '../../../infrastructure/repositories/StoryWriteRepository'
import { TagRepository } from '../../../infrastructure/repositories/TagRepository'
import { TagRepositoryWithCache } from '../../../infrastructure/repositories/TagRepositoryWithCache'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { mediaGatewayMock, userGatewayMock } from '../../testFactory'

const DEFAULT_REPLIES_PREVIEW_LIMIT = new NonNegativeInteger(4)
const DEFAULT_REPLIES_SORT_ORDER = OrderEnum.Ascending

export function createSystemWiring(persistenceHarness: PersistenceHarness) {
  const tagMapper = new TagInfrastructureMapper()
  const tagRepo = new TagRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    tagMapper
  )
  const tagRepositoryCache = new TTLCache<Tag | Tag[]>({ ttlSeconds: 60 })
  const tagRepository = new TagRepositoryWithCache(tagRepo, tagRepositoryCache)

  const postWriteRepository = new PostWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext
  )
  const storyWriteRepository = new StoryWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new PostInfrastructureMapper(),
    new StoryInfrastructureMapper(),
    postWriteRepository
  )

  const storyReadRepositoryCache = new TTLCache<StoryReadModelDTO>({ ttlSeconds: 60 })
  const storyReadRepository = new StoryReadRepositoryWithCache(
    new StoryReadRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new StoryInfrastructureMapper()
    ),
    storyReadRepositoryCache
  )

  const commentReadRepositoryCache = new TTLCache<CommentReadModelDTO>({ ttlSeconds: 60 })
  const commentReadRepository = new CommentReadRepositoryWithCache(
    new CommentReadRepository(
      {
        defaultRepliesPreviewLimit: DEFAULT_REPLIES_PREVIEW_LIMIT,
        defaultRepliesSortOrder: DEFAULT_REPLIES_SORT_ORDER
      },
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new CommentInfrastructureMapper()
    ),
    commentReadRepositoryCache
  )

  const commentWriteRepository = new CommentWriteRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new CommentInfrastructureMapper()
  )

  const postReadRepository = new PostReadRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new PostInfrastructureMapper()
  )

  const userGateway = userGatewayMock()
  const mediaGateway = mediaGatewayMock()
  const unitOfWork = persistenceHarness.createUnitOfWork()

  const storyApplicationMapper = new StoryApplicationMapper()
  const postApplicationMapper = new PostApplicationMapper()
  const tagApplicationMapper = new TagApplicationMapper()

  const storyAuthorizationService = new StoryAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<StoryAction, StoryAuthorizationPayloadMap>(storyRuleMap, storyRequestBuilderMap)
  )
  const commentAuthorizationService = new CommentAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<CommentAction, CommentAuthorizationPayloadMap>(commentRuleMap, commentRequestBuilderMap)
  )

  const resolveStoryTagIdsService = new ResolveStoryTagIdsService(tagRepository)
  const commentLookupService = new CommentLookupService(commentReadRepository, userGateway)
  const storyLookupService = new StoryLookupService(
    storyReadRepository,
    mediaGateway,
    tagRepository,
    userGateway,
    commentLookupService,
    storyApplicationMapper
  )
  const storyListSearchService = new StoryListSearchService(storyLookupService, userGateway)
  const storyCoverImageCleanupService = new StoryCoverImageCleanupService(storyReadRepository, mediaGateway)

  const findAllTagsUseCase = new FindAllTagsUseCase(tagRepository, tagApplicationMapper)

  const createStoryUseCase = () =>
    new CreateStoryUseCase(
      userGateway,
      mediaGateway,
      storyWriteRepository,
      storyLookupService,
      resolveStoryTagIdsService,
      unitOfWork
    )
  const updateStoryUseCase = () =>
    new UpdateStoryUseCase(
      mediaGateway,
      storyWriteRepository,
      storyLookupService,
      resolveStoryTagIdsService,
      storyCoverImageCleanupService,
      unitOfWork
    )
  const deleteStoryUseCase = () =>
    new DeleteStoryUseCase(
      storyWriteRepository,
      storyReadRepository,
      storyApplicationMapper,
      storyCoverImageCleanupService,
      unitOfWork
    )
  const findStoryUseCase = () => new FindStoryUseCase(storyLookupService)
  const searchStoriesUseCase = () => new SearchStoriesUseCase(storyListSearchService)
  const addCommentUseCase = () => new AddCommentUseCase(commentWriteRepository, commentLookupService, unitOfWork)
  const editCommentUseCase = () => new EditCommentUseCase(commentWriteRepository, commentLookupService, unitOfWork)
  const softDeleteCommentUseCase = () =>
    new SoftDeleteCommentUseCase(commentWriteRepository, commentLookupService, unitOfWork)
  const hardDeleteCommentUseCase = () =>
    new HardDeleteCommentUseCase(commentWriteRepository, commentLookupService, unitOfWork)
  const getCommentsUseCase = () => new GetCommentsUseCase(commentLookupService)
  const getRepliesUseCase = () => new GetRepliesUseCase(commentLookupService)
  const findMyStoriesUseCase = () => new FindMyStoriesUseCase(storyLookupService)
  const searchPostsUseCase = () =>
    new SearchPostsUseCase(storyListSearchService, storyLookupService, postReadRepository, userGateway, postApplicationMapper)

  return {
    persistenceHarness,
    tagRepository,
    storyWriteRepository,
    storyReadRepository,
    commentWriteRepository,
    commentReadRepository,
    postReadRepository,
    userGateway,
    mediaGateway,
    unitOfWork,
    storyAuthorizationService,
    commentAuthorizationService,
    findAllTagsUseCase,
    clearRepositoryCache: () => {
      storyReadRepositoryCache.invalidateByPrefix('findById:')
      commentReadRepositoryCache.invalidateByPrefix('getById:')
      tagRepositoryCache.invalidateByPrefix('findById:')
      tagRepositoryCache.delete('findAll')
    },
    createCreateStoryUseCase: createStoryUseCase,
    createUpdateStoryUseCase: updateStoryUseCase,
    createDeleteStoryUseCase: deleteStoryUseCase,
    createFindStoryUseCase: findStoryUseCase,
    createSearchStoriesUseCase: searchStoriesUseCase,
    createAddCommentUseCase: addCommentUseCase,
    createEditCommentUseCase: editCommentUseCase,
    createSoftDeleteCommentUseCase: softDeleteCommentUseCase,
    createGetCommentsUseCase: getCommentsUseCase,
    createSearchPostsUseCase: searchPostsUseCase,
    createCreateStoryUseCaseWithValidation: () =>
      new CreateStoryUseCaseWithValidation(createStoryUseCase(), userGateway, storyAuthorizationService),
    createUpdateStoryUseCaseWithValidation: () =>
      new UpdateStoryUseCaseWithValidation(
        updateStoryUseCase(),
        userGateway,
        storyReadRepository,
        storyAuthorizationService
      ),
    createDeleteStoryUseCaseWithValidation: () =>
      new DeleteStoryUseCaseWithValidation(
        deleteStoryUseCase(),
        userGateway,
        storyReadRepository,
        storyAuthorizationService
      ),
    createFindStoryUseCaseWithValidation: () =>
      new FindStoryUseCaseWithValidation(
        findStoryUseCase(),
        userGateway,
        storyReadRepository,
        storyAuthorizationService
      ),
    createSearchStoriesUseCaseWithValidation: () =>
      new SearchStoriesUseCaseWithValidation(searchStoriesUseCase(), userGateway, storyAuthorizationService),
    createFindMyStoriesUseCaseWithValidation: () =>
      new FindMyStoriesUseCaseWithValidation(findMyStoriesUseCase(), userGateway),
    createAddCommentUseCaseWithValidation: () =>
      new AddCommentUseCaseWithValidation(
        addCommentUseCase(),
        userGateway,
        commentAuthorizationService,
        postReadRepository,
        commentReadRepository
      ),
    createEditCommentUseCaseWithValidation: () =>
      new EditCommentUseCaseWithValidation(
        editCommentUseCase(),
        userGateway,
        commentReadRepository,
        commentAuthorizationService
      ),
    createSoftDeleteCommentUseCaseWithValidation: () =>
      new SoftDeleteCommentUseCaseWithValidation(
        softDeleteCommentUseCase(),
        userGateway,
        commentReadRepository,
        commentAuthorizationService
      ),
    createHardDeleteCommentUseCaseWithValidation: () =>
      new HardDeleteCommentUseCaseWithValidation(
        hardDeleteCommentUseCase(),
        userGateway,
        commentReadRepository,
        commentAuthorizationService
      ),
    createGetCommentsUseCaseWithValidation: () => new GetCommentsUseCaseWithValidation(getCommentsUseCase()),
    createGetRepliesUseCaseWithValidation: () => new GetRepliesUseCaseWithValidation(getRepliesUseCase()),
    createSearchPostsUseCaseWithValidation: () =>
      new SearchPostsUseCaseWithValidation(
        searchPostsUseCase(),
        userGateway,
        postApplicationMapper,
        storyAuthorizationService
      )
  }
}
