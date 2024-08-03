import { container as tsyringeContainer } from 'tsyringe'
import passport from 'passport'

import config from './config'
import connection from './infrastructure/dataAccess/database/connection'

// Platform & shared kernel
import {
  IUserToRequesterMapper,
  UserToRequesterMapper,
  IUnitOfWork,
  IHttpErrorMapper,
  ICronJob,
  IDomainEventService,
  DomainEventService,
  ITransactionContext,
  TTLCache,
  AbacEngine,
  DomainEventDispatcher
} from '@hatsuportal/platform'
import { IDomainEventDispatcher, IDomainEventHandlerRegistry } from '@hatsuportal/shared-kernel'

// User management
import {
  IUserInfrastructureMapper,
  IUserApplicationMapper,
  IUserWriteRepository,
  IUserReadRepository,
  UserLookupService,
  IUserAuthenticationService,
  UserApplicationMapper,
  UserInfrastructureMapper,
  UserAuthenticationService,
  IUserAuthorizationService,
  UserAuthorizationService,
  IPasswordFactory,
  PasswordFactory,
  StrictPasswordPolicy,
  DevelopmentPasswordPolicy,
  IProfileApiMapper,
  IPreferencesApiMapper,
  IAuthApiMapper,
  IUserApiMapper,
  UserApiMapper,
  ProfileApiMapper,
  PreferencesApiMapper,
  AuthApiMapper,
  UserWriteRepository,
  UserReadRepository,
  UserReadRepositoryWithCache,
  UserWriteRepositoryWithCache,
  UserReadModelDTO,
  UserQueryFacade,
  UserQueryMapper,
  User,
  SystemUserId,
  UserAction,
  UserAuthorizationPayloadMap,
  userRuleMap,
  userRequestBuilderMap,
  MediaGateway as MediaGatewayForUserManagement,
  MediaGatewayWithCache as MediaGatewayWithCacheForUserManagement,
  MediaGatewayMapper as MediaGatewayMapperForUserManagement,
  ImageAttachmentReadModelDTO as UserImageAttachmentReadModelDTO,
  IThemeRepository,
  ThemeRepository,
  IThemeInfrastructureMapper,
  ThemeInfrastructureMapper,
  IThemeApplicationMapper,
  ThemeApplicationMapper,
  IThemeAuthorizationService,
  ThemeAuthorizationService,
  ThemeAction,
  ThemeAuthorizationPayloadMap,
  themeRuleMap,
  themeRequestBuilderMap,
  IThemeApiMapper,
  ThemeApiMapper,
  ProfileImageCleanupService
} from '@hatsuportal/user-management'

// Post management
import {
  IPostApplicationMapper,
  PostApplicationMapper,
  IStoryApplicationMapper,
  IStoryReadRepository,
  IStoryWriteRepository,
  StoryInfrastructureMapper,
  StoryApplicationMapper,
  IStoryInfrastructureMapper,
  ITagRepository,
  ITagApplicationMapper,
  TagApplicationMapper,
  IPostInfrastructureMapper,
  PostInfrastructureMapper,
  CommentInfrastructureMapper,
  ICommentInfrastructureMapper,
  ICommentReadRepository,
  IPostReadRepository,
  ICommentWriteRepository,
  CommentApplicationMapper,
  ICommentApplicationMapper,
  ITagInfrastructureMapper,
  TagInfrastructureMapper,
  IStoryApiMapper,
  IPostApiMapper,
  ICommentApiMapper,
  ITagApiMapper,
  CommentApiMapper,
  StoryApiMapper,
  PostApiMapper,
  TagApiMapper,
  PostWriteRepository,
  PostReadRepository,
  StoryReadRepository,
  StoryWriteRepository,
  CommentReadRepository,
  CommentWriteRepository,
  TagRepository,
  IResolveStoryTagIdsService,
  ResolveStoryTagIdsService,
  CommentLookupService,
  StoryLookupService,
  StoryListSearchService,
  UserGateway as UserGatewayForPostManagement,
  UserGatewayMapper as UserGatewayMapperForPostManagement,
  MediaGateway as MediaGatewayForPostManagement,
  MediaGatewayWithCache as MediaGatewayWithCacheForPostManagement,
  MediaGatewayMapper as MediaGatewayMapperForPostManagement,
  StoryReadModelDTO,
  StoryReadRepositoryWithCache,
  CommentReadModelDTO,
  TagRepositoryWithCache,
  Tag,
  CommentReadRepositoryWithCache,
  ImageAttachmentReadModelDTO,
  ICommentAuthorizationService,
  CommentAuthorizationService,
  IStoryAuthorizationService,
  StoryAuthorizationService,
  StoryAction,
  StoryAuthorizationPayloadMap,
  storyRuleMap,
  storyRequestBuilderMap,
  CommentAction,
  CommentAuthorizationPayloadMap,
  commentRuleMap,
  commentRequestBuilderMap,
  StoryCoverImageCleanupService
} from '@hatsuportal/post-management'

// Media management
import {
  IImageApiMapper,
  IImageApplicationMapper,
  IImageFileService,
  IImageInfrastructureMapper,
  IImageProcessingService,
  IImageRepository,
  IImageStorageService,
  ImageApiMapper,
  ImageApplicationMapper,
  ImageFileService,
  ImageInfrastructureMapper,
  ImageProcessingService,
  ImageRepository,
  IMediaAuthorizationService,
  MediaAuthorizationService,
  StorageKeyGenerator as MediaStorageKeyGenerator,
  IImageLookupService,
  ImageLookupService,
  ImageRepositoryWithCache,
  IImagePersistenceService,
  ImagePersistenceService,
  ImageMetadataDTO,
  MediaQueryFacade,
  MediaQueryMapper,
  UserGateway as UserGatewayForMediaManagement,
  UserGatewayMapper as UserGatewayMapperForMediaManagement,
  MediaCommandMapper,
  MediaCommandFacade,
  StagedImageFactory,
  DeleteImageUseCase,
  MediaAction,
  MediaAuthorizationPayloadMap,
  mediaRuleMap,
  mediaRequestBuilderMap
} from '@hatsuportal/media-management'

// Local infrastructure
import { DomainEventHandlerRegistry } from './infrastructure/services/DomainEventHandlerRegistry'
import { DomainEventProcessor } from './infrastructure/services/DomainEventProcessor'
import { DomainEventCleaner } from './infrastructure/services/DomainEventCleaner'
import { OrphanImageCleaner } from './infrastructure/services/OrphanImageCleaner'
import { UnreferencedImageCleaner } from './infrastructure/services/UnreferencedImageCleaner'
import { IUseCaseFactory, UseCaseFactory } from './infrastructure/services/UseCaseFactory'
import { UnitOfWork } from './infrastructure/dataAccess/database/UnitOfWork'
import { NodeAsyncLocalTransactionContext, DomainEventRepository, DomainEventInfrastructureMapper } from '@hatsuportal/platform'
import { HttpErrorMapper } from './infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import { IAuthentication } from 'infrastructure/auth/IAuthentication'
import { Authentication } from './infrastructure/auth/Authentication'
import { TokenService } from './infrastructure/auth/TokenService'
import { KnexDataAccessProvider } from 'infrastructure/dataAccess/adapters/KnexDataAccessProvider'
import { PostgresRepositoryHelpers } from 'infrastructure/repositories/PostgresRepositoryHelpers'
import { CleanupOrphanImagesJob } from './infrastructure/cron/cleanupOrphanImagesJob'
import { CleanupDomainEventsJob } from './infrastructure/cron/cleanupDomainEventsJob'
import { ProcessDomainEventsJob } from './infrastructure/cron/processDomainEventsJob'
import { PostgresAdvisoryLock } from 'infrastructure/dataAccess/database/PostgresAdvisoryLock'
import { MediaUseCaseFactory } from 'infrastructure/services/MediaUseCaseFactory'
import { UserUseCaseFactory } from 'infrastructure/services/UserUseCaseFactory'
import { PostUseCaseFactory } from 'infrastructure/services/PostUseCaseFactory'
import { ThemeUseCaseFactory } from 'infrastructure/services/ThemeUseCaseFactory'
import { FileSystemImageStorageService } from 'infrastructure/services/FileSystemImageStorageService'
import { TigrisImageStorageService } from 'infrastructure/services/TigrisImageStorageService'

// ---------------------------------------------------------------------------
// Configuration: fail early
// ---------------------------------------------------------------------------
connection.getConnection()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Instances {
  mappers: MapperInstances
  services: ServiceInstances
  repositories: RepositoryInstances
  factories: FactoryInstances
  cronJobs: CronJobs
  eventDispatcher: IDomainEventDispatcher
  eventHandlerRegistry: IDomainEventHandlerRegistry
  authentication: IAuthentication
  tokenService: TokenService
  repositoryCaches: RepositoryCaches
}

interface MapperInstances {
  postInfrastructure: IPostInfrastructureMapper
  imageInfrastructure: IImageInfrastructureMapper
  storyInfrastructure: IStoryInfrastructureMapper
  commentInfrastructure: ICommentInfrastructureMapper
  userInfrastructure: IUserInfrastructureMapper
  imageApplication: IImageApplicationMapper
  storyApplication: IStoryApplicationMapper
  postApplication: IPostApplicationMapper
  userApplication: IUserApplicationMapper
  themeApplication: IThemeApplicationMapper
  tagApplication: ITagApplicationMapper
  tagInfrastructure: ITagInfrastructureMapper
  themeInfrastructure: IThemeInfrastructureMapper
  commentApplication: ICommentApplicationMapper
  imageApi: IImageApiMapper
  storyApi: IStoryApiMapper
  postApi: IPostApiMapper
  commentApi: ICommentApiMapper
  userApi: IUserApiMapper
  profileApi: IProfileApiMapper
  preferencesApi: IPreferencesApiMapper
  themeApi: IThemeApiMapper
  errorApi: IHttpErrorMapper
  authApi: IAuthApiMapper
  tagApi: ITagApiMapper
  userToRequesterMapper: IUserToRequesterMapper
  domainEventInfrastructure: DomainEventInfrastructureMapper
}

interface ServiceInstances {
  imageProcessing: IImageProcessingService
  imageStorage: IImageStorageService
  imageFile: IImageFileService
  imageLookupService: IImageLookupService
  imagePersistenceService: IImagePersistenceService
  resolveStoryTagIdsService: IResolveStoryTagIdsService
  userAuthenticationService: IUserAuthenticationService
  unitOfWork: IUnitOfWork
  storyAuthorizationService: IStoryAuthorizationService
  commentAuthorizationService: ICommentAuthorizationService
  mediaAuthorizationService: IMediaAuthorizationService
  userAuthorizationService: IUserAuthorizationService
  themeAuthorizationService: IThemeAuthorizationService
  domainEventService: IDomainEventService
  mediaStorageKeyGenerator: MediaStorageKeyGenerator
}

interface RepositoryInstances {
  postRead: IPostReadRepository
  image: IImageRepository
  storyRead: IStoryReadRepository
  storyWrite: IStoryWriteRepository
  commentRead: ICommentReadRepository
  commentWrite: ICommentWriteRepository
  userWrite: IUserWriteRepository
  userRead: IUserReadRepository
  theme: IThemeRepository
  tag: ITagRepository
  domainEvent: DomainEventRepository
}

interface FactoryInstances {
  useCase: IUseCaseFactory
}

interface CronJobs {
  processDomainEvents: ICronJob
  cleanupOrphanImages: ICronJob
  cleanupDomainEvents: ICronJob
}

export interface RepositoryCaches {
  userWrite: TTLCache<User>
  userRead: TTLCache<UserReadModelDTO>
  image: TTLCache<ImageMetadataDTO>
  tag: TTLCache<Tag | Tag[]>
  storyRead: TTLCache<StoryReadModelDTO>
  commentRead: TTLCache<CommentReadModelDTO>
  mediaGateway: TTLCache<ImageAttachmentReadModelDTO>
}

interface RepositoryCreationResult {
  repositories: RepositoryInstances
  caches: Pick<RepositoryCaches, 'userWrite' | 'userRead' | 'image' | 'tag' | 'storyRead' | 'commentRead'>
}

interface UseCaseFactoryCreationResult {
  useCaseFactory: IUseCaseFactory
  tokenService: TokenService
  caches: Pick<RepositoryCaches, 'mediaGateway'>
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
function registerAll(instances: Instances): void {
  registerMappers(instances.mappers)
  registerFactories(instances.factories)
  registerAuthentication(instances.authentication)
  registerCronJobs(instances.cronJobs)
}

function registerMappers(mappers: MapperInstances): void {
  const apiMappers: Array<[string, object]> = [
    ['IImageApiMapper', mappers.imageApi],
    ['IStoryApiMapper', mappers.storyApi],
    ['IPostApiMapper', mappers.postApi],
    ['ICommentApiMapper', mappers.commentApi],
    ['IUserApiMapper', mappers.userApi],
    ['IUserApplicationMapper', mappers.userApplication],
    ['IProfileApiMapper', mappers.profileApi],
    ['IPreferencesApiMapper', mappers.preferencesApi],
    ['IThemeApiMapper', mappers.themeApi],
    ['IAuthApiMapper', mappers.authApi],
    ['IHttpErrorMapper', mappers.errorApi],
    ['ITagApiMapper', mappers.tagApi]
  ]
  apiMappers.forEach(([token, impl]) => tsyringeContainer.register(token, { useValue: impl }))
}

function registerFactories(factories: FactoryInstances): void {
  tsyringeContainer.register('IUseCaseFactory', { useValue: factories.useCase })
}

function registerAuthentication(authentication: IAuthentication): void {
  tsyringeContainer.register('IAuthentication', { useValue: authentication })
}

function registerCronJobs(cronJobs: CronJobs): void {
  tsyringeContainer.register('ICronJob', { useValue: cronJobs.processDomainEvents })
  tsyringeContainer.register('ICronJob', { useValue: cronJobs.cleanupOrphanImages })
  tsyringeContainer.register('ICronJob', { useValue: cronJobs.cleanupDomainEvents })
}

// ---------------------------------------------------------------------------
// Instance Creation: Mappers (stateless, no dependencies)
// ---------------------------------------------------------------------------
function createMappers(): MapperInstances {
  return {
    postInfrastructure: new PostInfrastructureMapper(),
    imageInfrastructure: new ImageInfrastructureMapper(),
    storyInfrastructure: new StoryInfrastructureMapper(),
    commentInfrastructure: new CommentInfrastructureMapper(),
    userInfrastructure: new UserInfrastructureMapper(),
    tagApplication: new TagApplicationMapper(),
    tagInfrastructure: new TagInfrastructureMapper(),
    commentApplication: new CommentApplicationMapper(),
    imageApplication: new ImageApplicationMapper(),
    storyApplication: new StoryApplicationMapper(),
    postApplication: new PostApplicationMapper(),
    userApplication: new UserApplicationMapper(),
    themeApplication: new ThemeApplicationMapper(),
    themeInfrastructure: new ThemeInfrastructureMapper(),
    imageApi: new ImageApiMapper(),
    storyApi: new StoryApiMapper(),
    postApi: new PostApiMapper(),
    commentApi: new CommentApiMapper(),
    userApi: new UserApiMapper(),
    profileApi: new ProfileApiMapper(),
    preferencesApi: new PreferencesApiMapper(),
    themeApi: new ThemeApiMapper(),
    errorApi: new HttpErrorMapper(),
    authApi: new AuthApiMapper(),
    tagApi: new TagApiMapper(),
    userToRequesterMapper: new UserToRequesterMapper(),
    domainEventInfrastructure: new DomainEventInfrastructureMapper()
  }
}

// ---------------------------------------------------------------------------
// Instance Creation: Data access layer
// ---------------------------------------------------------------------------
function createDataAccessLayer() {
  const knex = connection.getConnection()
  const dataAccessProvider = new KnexDataAccessProvider(knex)
  const helpers = new PostgresRepositoryHelpers()
  const eventDispatcher = new DomainEventDispatcher()
  const eventHandlerRegistry = new DomainEventHandlerRegistry(eventDispatcher)

  return {
    dataAccessProvider,
    helpers,
    eventDispatcher,
    eventHandlerRegistry
  }
}

// ---------------------------------------------------------------------------
// Instance Creation: Repositories
// ---------------------------------------------------------------------------
function createRepositories(
  dataAccessProvider: KnexDataAccessProvider,
  helpers: PostgresRepositoryHelpers,
  mappers: MapperInstances,
  transactionContext: ITransactionContext
): RepositoryCreationResult {
  const domainEventRepository = new DomainEventRepository(
    dataAccessProvider,
    helpers,
    transactionContext,
    mappers.domainEventInfrastructure
  )

  const userWriteRepositoryCache = new TTLCache<User>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  const userWriteRepository = new UserWriteRepositoryWithCache(
    new UserWriteRepository(dataAccessProvider, helpers, transactionContext, mappers.userInfrastructure),
    userWriteRepositoryCache
  )
  const userReadRepositoryCache = new TTLCache<UserReadModelDTO>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  const userReadRepository = new UserReadRepositoryWithCache(
    new UserReadRepository(dataAccessProvider, helpers, transactionContext, mappers.userInfrastructure),
    userReadRepositoryCache
  )

  const imageRepositoryCache = new TTLCache<ImageMetadataDTO>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  const imageRepository = new ImageRepositoryWithCache(
    new ImageRepository(dataAccessProvider, helpers, transactionContext, mappers.imageInfrastructure),
    imageRepositoryCache,
    transactionContext
  )

  const tagRepositoryCache = new TTLCache<Tag | Tag[]>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  const tagRepository = new TagRepositoryWithCache(
    new TagRepository(dataAccessProvider, helpers, transactionContext, mappers.tagInfrastructure),
    tagRepositoryCache
  )

  const postWriteRepository = new PostWriteRepository(dataAccessProvider, helpers, transactionContext)
  const storyReadRepositoryCache = new TTLCache<StoryReadModelDTO>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  const storyReadRepositoryWithCache = new StoryReadRepositoryWithCache(
    new StoryReadRepository(dataAccessProvider, helpers, transactionContext, mappers.storyInfrastructure),
    storyReadRepositoryCache
  )

  const commentReadRepositoryCache = new TTLCache<CommentReadModelDTO>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  const commentReadRepository = new CommentReadRepositoryWithCache(
    new CommentReadRepository(
      {
        defaultRepliesPreviewLimit: config.comment.defaultRepliesPreviewLimit,
        defaultRepliesSortOrder: config.comment.defaultRepliesSortOrder
      },
      dataAccessProvider,
      helpers,
      transactionContext,
      mappers.commentInfrastructure
    ),
    commentReadRepositoryCache
  )

  return {
    repositories: {
      image: imageRepository,
      postRead: new PostReadRepository(dataAccessProvider, helpers, transactionContext, mappers.postInfrastructure),
      storyRead: storyReadRepositoryWithCache,
      storyWrite: new StoryWriteRepository(
        dataAccessProvider,
        helpers,
        transactionContext,
        mappers.postInfrastructure,
        mappers.storyInfrastructure,
        postWriteRepository
      ),
      commentRead: commentReadRepository,
      commentWrite: new CommentWriteRepository(dataAccessProvider, helpers, transactionContext, mappers.commentInfrastructure),
      userWrite: userWriteRepository,
      userRead: userReadRepository,
      theme: new ThemeRepository(dataAccessProvider, helpers, transactionContext, mappers.themeInfrastructure),
      tag: tagRepository,
      domainEvent: domainEventRepository
    },
    caches: {
      userWrite: userWriteRepositoryCache,
      userRead: userReadRepositoryCache,
      image: imageRepositoryCache,
      tag: tagRepositoryCache,
      storyRead: storyReadRepositoryCache,
      commentRead: commentReadRepositoryCache
    }
  }
}

// ---------------------------------------------------------------------------
// Instance Creation: Services
// ---------------------------------------------------------------------------
function createServices(
  mappers: MapperInstances,
  repositories: RepositoryInstances,
  domainEventRepository: DomainEventRepository,
  passwordFactory: IPasswordFactory,
  transactionContext: ITransactionContext
): ServiceInstances {
  const imageProcessingService = new ImageProcessingService()
  const imageStorageService =
    process.env.NODE_ENV === 'prod'
      ? new TigrisImageStorageService(config.images.basePath)
      : new FileSystemImageStorageService(config.images.basePath)
  const domainEventService = new DomainEventService(domainEventRepository)
  const imageFileService = new ImageFileService(imageProcessingService)

  const storyAbacEngine = new AbacEngine<StoryAction, StoryAuthorizationPayloadMap>(storyRuleMap, storyRequestBuilderMap)
  const commentAbacEngine = new AbacEngine<CommentAction, CommentAuthorizationPayloadMap>(commentRuleMap, commentRequestBuilderMap)
  const mediaAbacEngine = new AbacEngine<MediaAction, MediaAuthorizationPayloadMap>(mediaRuleMap, mediaRequestBuilderMap)
  const userAbacEngine = new AbacEngine<UserAction, UserAuthorizationPayloadMap>(userRuleMap, userRequestBuilderMap)
  const themeAbacEngine = new AbacEngine<ThemeAction, ThemeAuthorizationPayloadMap>(themeRuleMap, themeRequestBuilderMap)
  const mediaStorageKeyGenerator = new MediaStorageKeyGenerator()
  const unitOfWork = new UnitOfWork(domainEventService, connection, transactionContext)

  return {
    imageProcessing: imageProcessingService,
    imageStorage: imageStorageService,
    imageFile: imageFileService,
    imageLookupService: new ImageLookupService(repositories.image, imageStorageService, mappers.imageApplication),
    imagePersistenceService: new ImagePersistenceService(
      repositories.image,
      imageFileService,
      imageStorageService,
      mediaStorageKeyGenerator,
      transactionContext,
      config.images.versionRetentionCount,
      unitOfWork,
      mappers.imageApplication
    ),
    resolveStoryTagIdsService: new ResolveStoryTagIdsService(repositories.tag),
    userAuthenticationService: new UserAuthenticationService(repositories.userWrite, passwordFactory),
    unitOfWork,
    mediaStorageKeyGenerator,
    storyAuthorizationService: new StoryAuthorizationService(mappers.userToRequesterMapper, storyAbacEngine),
    commentAuthorizationService: new CommentAuthorizationService(mappers.userToRequesterMapper, commentAbacEngine),
    mediaAuthorizationService: new MediaAuthorizationService(mappers.userToRequesterMapper, mediaAbacEngine),
    userAuthorizationService: new UserAuthorizationService(mappers.userToRequesterMapper, userAbacEngine),
    themeAuthorizationService: new ThemeAuthorizationService(mappers.userToRequesterMapper, themeAbacEngine),
    domainEventService
  }
}

// ---------------------------------------------------------------------------
// Instance Creation: Gateways & use case factories
// ---------------------------------------------------------------------------
function createUseCaseFactories(
  mappers: MapperInstances,
  repositories: RepositoryInstances,
  services: ServiceInstances,
  passwordFactory: IPasswordFactory
): UseCaseFactoryCreationResult {
  const tokenService = new TokenService()
  const userQueryFacade = new UserQueryFacade(repositories.userRead, new UserQueryMapper())

  const userGatewayForPostManagement = new UserGatewayForPostManagement(userQueryFacade, new UserGatewayMapperForPostManagement())
  const userGatewayForMediaManagement = new UserGatewayForMediaManagement(userQueryFacade, new UserGatewayMapperForMediaManagement())

  const mediaQueryFacade = new MediaQueryFacade(services.imageLookupService, new MediaQueryMapper())
  const mediaUseCaseFactory = new MediaUseCaseFactory(
    userGatewayForMediaManagement,
    repositories.image,
    services.imageLookupService,
    services.imagePersistenceService,
    mappers.imageApplication,
    services.mediaStorageKeyGenerator,
    services.mediaAuthorizationService,
    services.unitOfWork
  )
  const stagedImageFactory = new StagedImageFactory(services.mediaStorageKeyGenerator)
  const mediaCommandFacade = new MediaCommandFacade(
    services.imagePersistenceService,
    stagedImageFactory,
    mediaUseCaseFactory.createCreateStagedImageVersionUseCase(),
    mediaUseCaseFactory.createPromoteImageVersionUseCase(),
    mediaUseCaseFactory.createDeleteImageUseCase(),
    new MediaCommandMapper()
  )
  const mediaGatewayCache = new TTLCache<ImageAttachmentReadModelDTO>({ ttlSeconds: config.cache.mediaStorageTTLSeconds })
  const mediaGatewayForPostManagement = new MediaGatewayWithCacheForPostManagement(
    new MediaGatewayForPostManagement(mediaQueryFacade, mediaCommandFacade, new MediaGatewayMapperForPostManagement()),
    mediaGatewayCache
  )
  const mediaGatewayForUserManagement = new MediaGatewayWithCacheForUserManagement(
    new MediaGatewayForUserManagement(mediaQueryFacade, mediaCommandFacade, new MediaGatewayMapperForUserManagement()),
    mediaGatewayCache as TTLCache<UserImageAttachmentReadModelDTO>
  )

  const commentLookupService = new CommentLookupService(repositories.commentRead, userGatewayForPostManagement)
  const storyLookupService = new StoryLookupService(
    repositories.storyRead,
    mediaGatewayForPostManagement,
    repositories.tag,
    userGatewayForPostManagement,
    commentLookupService,
    mappers.storyApplication
  )
  const storyListSearchService = new StoryListSearchService(storyLookupService, userGatewayForPostManagement)

  const userLookupService = new UserLookupService(repositories.userRead)
  const profileImageCleanupService = new ProfileImageCleanupService(repositories.userRead, mediaGatewayForUserManagement)
  const storyCoverImageCleanupService = new StoryCoverImageCleanupService(repositories.storyRead, mediaGatewayForPostManagement)

  const userUseCaseFactory = new UserUseCaseFactory(
    repositories.userWrite,
    repositories.userRead,
    userLookupService,
    services.userAuthenticationService,
    mappers.userApplication,
    services.userAuthorizationService,
    repositories.theme,
    passwordFactory,
    services.unitOfWork,
    tokenService,
    mediaGatewayForUserManagement,
    profileImageCleanupService
  )

  const themeUseCaseFactory = new ThemeUseCaseFactory(
    repositories.theme,
    repositories.userRead,
    mappers.themeApplication,
    services.themeAuthorizationService,
    services.unitOfWork
  )

  const postUseCaseFactory = new PostUseCaseFactory(
    userGatewayForPostManagement,
    mediaGatewayForPostManagement,
    services.storyAuthorizationService,
    services.commentAuthorizationService,
    repositories.postRead,
    repositories.storyRead,
    repositories.storyWrite,
    mappers.storyApplication,
    mappers.postApplication,
    storyLookupService,
    storyListSearchService,
    services.unitOfWork,
    repositories.commentRead,
    repositories.commentWrite,
    commentLookupService,
    repositories.tag,
    mappers.tagApplication,
    services.resolveStoryTagIdsService,
    storyCoverImageCleanupService
  )

  const useCaseFactory = new UseCaseFactory(userUseCaseFactory, mediaUseCaseFactory, postUseCaseFactory, themeUseCaseFactory)

  return {
    useCaseFactory,
    tokenService,
    caches: {
      mediaGateway: mediaGatewayCache
    }
  }
}

// ---------------------------------------------------------------------------
// Instance Creation: Cron jobs
// ---------------------------------------------------------------------------
function createCronJobs(
  domainEventRepository: DomainEventRepository,
  mappers: MapperInstances,
  eventDispatcher: IDomainEventDispatcher,
  repositories: RepositoryInstances,
  services: ServiceInstances,
  systemUserId: SystemUserId
): CronJobs {
  const processingLock = new PostgresAdvisoryLock(connection, 100100)
  const cleanupLock = new PostgresAdvisoryLock(connection, 100101)
  const domainEventCleanupLock = new PostgresAdvisoryLock(connection, 100102)

  const domainEventProcessor = new DomainEventProcessor(
    domainEventRepository,
    mappers.domainEventInfrastructure,
    eventDispatcher,
    processingLock
  )
  const orphanImageCleaner = new OrphanImageCleaner(repositories.image, services.imageStorage, config.images.orphanMinAgeMs, cleanupLock)
  const deleteImageUseCase = new DeleteImageUseCase(
    services.imageLookupService,
    services.imagePersistenceService,
    mappers.imageApplication,
    services.unitOfWork
  )
  const unreferencedImageCleaner = new UnreferencedImageCleaner(
    repositories.image,
    repositories.storyRead,
    repositories.userRead,
    deleteImageUseCase,
    systemUserId,
    config.images.orphanMinAgeMs,
    cleanupLock
  )
  const domainEventCleaner = new DomainEventCleaner(domainEventRepository, config.domainEvents.maxAgeSeconds, domainEventCleanupLock)

  return {
    processDomainEvents: new ProcessDomainEventsJob(domainEventProcessor, config.cron.processDomainEventsJob),
    cleanupOrphanImages: new CleanupOrphanImagesJob(orphanImageCleaner, unreferencedImageCleaner, config.cron.cleanupOrphanImagesJob),
    cleanupDomainEvents: new CleanupDomainEventsJob(domainEventCleaner, config.cron.cleanupDomainEventsJob)
  }
}

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
function createInstances(): Instances {
  const mappers = createMappers()
  const dataAccess = createDataAccessLayer()
  const transactionContext = new NodeAsyncLocalTransactionContext()
  const { repositories, caches: repositoryLayerCaches } = createRepositories(
    dataAccess.dataAccessProvider,
    dataAccess.helpers,
    mappers,
    transactionContext
  )

  const passwordFactory = new PasswordFactory(process.env.NODE_ENV === 'dev' ? new DevelopmentPasswordPolicy() : new StrictPasswordPolicy())
  const services = createServices(mappers, repositories, repositories.domainEvent, passwordFactory, transactionContext)
  const {
    useCaseFactory,
    tokenService,
    caches: useCaseLayerCaches
  } = createUseCaseFactories(mappers, repositories, services, passwordFactory)

  const systemUserId = new SystemUserId()

  const cronJobs = createCronJobs(repositories.domainEvent, mappers, dataAccess.eventDispatcher, repositories, services, systemUserId)

  return {
    mappers,
    services,
    repositories,
    factories: { useCase: useCaseFactory },
    cronJobs,
    eventDispatcher: dataAccess.eventDispatcher,
    eventHandlerRegistry: dataAccess.eventHandlerRegistry,
    authentication: new Authentication(passport, repositories.userRead, mappers.userApplication),
    tokenService,
    repositoryCaches: {
      ...repositoryLayerCaches,
      ...useCaseLayerCaches
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function init() {
  try {
    const instances = createInstances()
    registerAll(instances)
    return tsyringeContainer
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to configure dependency container: ${message}`)
  }
}

// exported for tests only
export function initForSystemTests(): { container: typeof tsyringeContainer; repositoryCaches: RepositoryCaches } {
  const instances = createInstances()
  registerAll(instances)
  return {
    container: tsyringeContainer,
    repositoryCaches: instances.repositoryCaches
  }
}
