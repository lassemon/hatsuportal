import { container as tsyringeContainer } from 'tsyringe'
import passport from 'passport'

import config from './config'
import connection from './infrastructure/dataAccess/database/connection'

// Platform & shared kernel
import {
  IUserToRequesterMapper,
  UserToRequesterMapper,
  ITransactionManager,
  IHttpErrorMapper,
  ICronJob,
  IDomainEventService,
  DomainEventService,
  ITransactionAware,
  TTLCache,
  AbacEngine
} from '@hatsuportal/platform'
import {
  DomainEventDispatcher,
  IDomainEventDispatcher,
  IDomainEventHandlerRegistry,
  UniqueId,
  UnixTimestamp
} from '@hatsuportal/shared-kernel'

// User management
import {
  IUserInfrastructureMapper,
  IUserApplicationMapper,
  IUserRepository,
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
  IAuthApiMapper,
  IUserApiMapper,
  UserApiMapper,
  ProfileApiMapper,
  AuthApiMapper,
  UserRepository,
  PostGateway as PostGatewayForUserManagement,
  PostGatewayMapper as PostGatewayMapperForUserManagement,
  UserQueryFacade,
  UserQueryMapper,
  UserRepositoryWithCache,
  User,
  UserAction,
  UserAuthorizationPayloadMap,
  userRuleMap,
  userRequestBuilderMap
} from '@hatsuportal/user-management'

// Post management
import {
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
  ICommentApiMapper,
  ITagApiMapper,
  CommentApiMapper,
  StoryApiMapper,
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
  PostQueryFacade,
  CommentLookupService,
  StoryLookupService,
  UserGateway as UserGatewayForPostManagement,
  UserGatewayMapper as UserGatewayMapperForPostManagement,
  MediaGateway as MediaGatewayForPostManagement,
  MediaGatewayWithCache as MediaGatewayWithCacheForPostManagement,
  MediaGatewayMapper as MediaGatewayMapperForPostManagement,
  PostQueryMapper,
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
  commentRequestBuilderMap
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
  ImageStorageService,
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
import { IUseCaseFactory, UseCaseFactory } from './infrastructure/services/UseCaseFactory'
import { UnitOfWork } from './infrastructure/dataAccess/database/UnitOfWork'
import { HttpErrorMapper } from './infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import { IAuthentication } from 'infrastructure/auth/IAuthentication'
import { Authentication } from './infrastructure/auth/Authentication'
import { TokenService } from './infrastructure/auth/TokenService'
import { KnexDataAccessProvider } from 'infrastructure/dataAccess/adapters/KnexDataAccessProvider'
import { PostgresRepositoryHelpers } from 'infrastructure/repositories/PostgresRepositoryHelpers'
import { DomainEventRepository } from './infrastructure/repositories/DomainEventRepository'
import { DomainEventInfrastructureMapper } from './infrastructure/mappers/DomainEventInfrastructureMapper'
import { CleanupOrphanImagesJob } from './infrastructure/cron/cleanupOrphanImagesJob'
import { CleanupDomainEventsJob } from './infrastructure/cron/cleanupDomainEventsJob'
import { ProcessDomainEventsJob } from './infrastructure/cron/processDomainEventsJob'
import { PostgresAdvisoryLock } from 'infrastructure/dataAccess/database/PostgresAdvisoryLock'
import { MediaUseCaseFactory } from 'infrastructure/services/MediaUseCaseFactory'
import { UserUseCaseFactory } from 'infrastructure/services/UserUseCaseFactory'
import { PostUseCaseFactory } from 'infrastructure/services/PostUseCaseFactory'

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
  eventDispatcher: IDomainEventDispatcher<UnixTimestamp>
  eventHandlerRegistry: IDomainEventHandlerRegistry
  authentication: IAuthentication
  tokenService: TokenService
}

interface MapperInstances {
  postInfrastructure: IPostInfrastructureMapper
  imageInfrastructure: IImageInfrastructureMapper
  storyInfrastructure: IStoryInfrastructureMapper
  commentInfrastructure: ICommentInfrastructureMapper
  userInfrastructure: IUserInfrastructureMapper
  imageApplication: IImageApplicationMapper
  storyApplication: IStoryApplicationMapper
  userApplication: IUserApplicationMapper
  tagApplication: ITagApplicationMapper
  tagInfrastructure: ITagInfrastructureMapper
  commentApplication: ICommentApplicationMapper
  imageApi: IImageApiMapper
  storyApi: IStoryApiMapper
  commentApi: ICommentApiMapper
  userApi: IUserApiMapper
  profileApi: IProfileApiMapper
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
  transactionManager: ITransactionManager<UniqueId, UnixTimestamp>
  storyAuthorizationService: IStoryAuthorizationService
  commentAuthorizationService: ICommentAuthorizationService
  mediaAuthorizationService: IMediaAuthorizationService
  userAuthorizationService: IUserAuthorizationService
  domainEventService: IDomainEventService
  mediaStorageKeyGenerator: MediaStorageKeyGenerator
}

interface RepositoryInstances {
  postRead: IPostReadRepository & ITransactionAware
  image: IImageRepository & ITransactionAware
  storyRead: IStoryReadRepository & ITransactionAware
  storyWrite: IStoryWriteRepository & ITransactionAware
  commentRead: ICommentReadRepository & ITransactionAware
  commentWrite: ICommentWriteRepository & ITransactionAware
  user: IUserRepository & ITransactionAware
  tag: ITagRepository & ITransactionAware
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
    ['ICommentApiMapper', mappers.commentApi],
    ['IUserApiMapper', mappers.userApi],
    ['IUserApplicationMapper', mappers.userApplication],
    ['IProfileApiMapper', mappers.profileApi],
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
    userApplication: new UserApplicationMapper(),
    imageApi: new ImageApiMapper(),
    storyApi: new StoryApiMapper(),
    commentApi: new CommentApiMapper(),
    userApi: new UserApiMapper(),
    profileApi: new ProfileApiMapper(),
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
  mappers: MapperInstances
): RepositoryInstances {
  const domainEventRepository = new DomainEventRepository(dataAccessProvider, helpers, mappers.domainEventInfrastructure)

  const userRepository = new UserRepositoryWithCache(
    new UserRepository(dataAccessProvider, helpers, mappers.userInfrastructure),
    new TTLCache<User | User[]>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  )
  const imageRepository = new ImageRepositoryWithCache(
    new ImageRepository(dataAccessProvider, helpers, mappers.imageInfrastructure),
    new TTLCache<ImageMetadataDTO>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  )
  const tagRepository = new TagRepositoryWithCache(
    new TagRepository(dataAccessProvider, helpers, mappers.tagInfrastructure),
    new TTLCache<Tag | Tag[]>({ ttlSeconds: config.cache.repositoryTTLSeconds })
  )
  const postWriteRepository = new PostWriteRepository(dataAccessProvider, helpers)

  return {
    image: imageRepository,
    postRead: new PostReadRepository(dataAccessProvider, helpers, mappers.postInfrastructure),
    storyRead: new StoryReadRepositoryWithCache(
      new StoryReadRepository(dataAccessProvider, helpers, mappers.storyInfrastructure),
      new TTLCache<StoryReadModelDTO>({ ttlSeconds: config.cache.repositoryTTLSeconds })
    ),
    storyWrite: new StoryWriteRepository(
      dataAccessProvider,
      helpers,
      mappers.postInfrastructure,
      mappers.storyInfrastructure,
      postWriteRepository
    ),
    commentRead: new CommentReadRepositoryWithCache(
      new CommentReadRepository(
        {
          defaultRepliesPreviewLimit: config.comment.defaultRepliesPreviewLimit,
          defaultRepliesSortOrder: config.comment.defaultRepliesSortOrder
        },
        dataAccessProvider,
        helpers,
        mappers.commentInfrastructure
      ),
      new TTLCache<CommentReadModelDTO>({ ttlSeconds: config.cache.repositoryTTLSeconds })
    ),
    commentWrite: new CommentWriteRepository(dataAccessProvider, helpers, mappers.commentInfrastructure),
    user: userRepository,
    tag: tagRepository,
    domainEvent: domainEventRepository
  }
}

// ---------------------------------------------------------------------------
// Instance Creation: Services
// ---------------------------------------------------------------------------
function createServices(
  mappers: MapperInstances,
  repositories: RepositoryInstances,
  domainEventRepository: DomainEventRepository,
  passwordFactory: IPasswordFactory
): ServiceInstances {
  const imageProcessingService = new ImageProcessingService()
  const imageStorageService = new ImageStorageService()
  const domainEventService = new DomainEventService(domainEventRepository)
  const imageFileService = new ImageFileService(imageProcessingService, imageStorageService)

  const storyAbacEngine = new AbacEngine<StoryAction, StoryAuthorizationPayloadMap>(storyRuleMap, storyRequestBuilderMap)
  const commentAbacEngine = new AbacEngine<CommentAction, CommentAuthorizationPayloadMap>(commentRuleMap, commentRequestBuilderMap)
  const mediaAbacEngine = new AbacEngine<MediaAction, MediaAuthorizationPayloadMap>(mediaRuleMap, mediaRequestBuilderMap)
  const userAbacEngine = new AbacEngine<UserAction, UserAuthorizationPayloadMap>(userRuleMap, userRequestBuilderMap)

  return {
    imageProcessing: imageProcessingService,
    imageStorage: imageStorageService,
    imageFile: imageFileService,
    imageLookupService: new ImageLookupService(repositories.image, imageFileService, mappers.imageApplication),
    imagePersistenceService: new ImagePersistenceService(
      repositories.image,
      imageFileService,
      mappers.imageApplication,
      config.images.versionRetentionCount
    ),
    resolveStoryTagIdsService: new ResolveStoryTagIdsService(repositories.tag),
    userAuthenticationService: new UserAuthenticationService(repositories.user, passwordFactory),
    transactionManager: new UnitOfWork(domainEventRepository, domainEventService, connection),
    mediaStorageKeyGenerator: new MediaStorageKeyGenerator(),
    storyAuthorizationService: new StoryAuthorizationService(mappers.userToRequesterMapper, storyAbacEngine),
    commentAuthorizationService: new CommentAuthorizationService(
      mappers.commentApplication,
      mappers.userToRequesterMapper,
      commentAbacEngine
    ),
    mediaAuthorizationService: new MediaAuthorizationService(mappers.userToRequesterMapper, mediaAbacEngine),
    userAuthorizationService: new UserAuthorizationService(mappers.userToRequesterMapper, userAbacEngine),
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
) {
  const tokenService = new TokenService()
  const userQueryFacade = new UserQueryFacade(repositories.user, new UserQueryMapper())

  const userGatewayForPostManagement = new UserGatewayForPostManagement(userQueryFacade, new UserGatewayMapperForPostManagement())
  const userGatewayForMediaManagement = new UserGatewayForMediaManagement(
    userQueryFacade,
    //userCommandFacade,
    new UserGatewayMapperForMediaManagement()
  )

  const mediaQueryFacade = new MediaQueryFacade(services.imageLookupService, new MediaQueryMapper())
  const mediaUseCaseFactory = new MediaUseCaseFactory(
    userGatewayForMediaManagement,
    services.imageLookupService,
    services.imagePersistenceService,
    services.domainEventService,
    mappers.imageApplication,
    services.mediaStorageKeyGenerator,
    services.mediaAuthorizationService
  )
  const mediaCommandFacade = new MediaCommandFacade(
    mediaUseCaseFactory.createCreateStagedImageVersionUseCase(),
    mediaUseCaseFactory.createPromoteImageVersionUseCase(),
    mediaUseCaseFactory.createDiscardImageVersionUseCase(),
    mediaUseCaseFactory.createUpdateImageUseCase(),
    mediaUseCaseFactory.createDeleteImageUseCase(),
    new MediaCommandMapper()
  )
  const mediaGatewayForPostManagement = new MediaGatewayWithCacheForPostManagement(
    new MediaGatewayForPostManagement(mediaQueryFacade, mediaCommandFacade, new MediaGatewayMapperForPostManagement()),
    new TTLCache<ImageAttachmentReadModelDTO>({ ttlSeconds: config.cache.mediaStorageTTLSeconds })
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
  const postQueryFacade = new PostQueryFacade(storyLookupService, new PostQueryMapper())
  const postGatewayForUserManagement = new PostGatewayForUserManagement(postQueryFacade, new PostGatewayMapperForUserManagement())

  const userUseCaseFactory = new UserUseCaseFactory(
    repositories.user,
    postGatewayForUserManagement,
    services.userAuthenticationService,
    mappers.userApplication,
    services.userAuthorizationService,
    passwordFactory,
    services.domainEventService,
    tokenService
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
    storyLookupService,
    services.transactionManager,
    repositories.commentRead,
    repositories.commentWrite,
    commentLookupService,
    repositories.tag,
    mappers.tagApplication,
    services.resolveStoryTagIdsService,
    services.domainEventService
  )

  const useCaseFactory = new UseCaseFactory(userUseCaseFactory, mediaUseCaseFactory, postUseCaseFactory)

  return { useCaseFactory, tokenService }
}

// ---------------------------------------------------------------------------
// Instance Creation: Cron jobs
// ---------------------------------------------------------------------------
function createCronJobs(
  domainEventRepository: DomainEventRepository,
  mappers: MapperInstances,
  eventDispatcher: IDomainEventDispatcher<UnixTimestamp>,
  repositories: RepositoryInstances
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
  const orphanImageCleaner = new OrphanImageCleaner(repositories.image, config.images.basePath, config.images.orphanMaxAgeMs, cleanupLock)
  const domainEventCleaner = new DomainEventCleaner(domainEventRepository, config.domainEvents.maxAgeSeconds, domainEventCleanupLock)

  return {
    processDomainEvents: new ProcessDomainEventsJob(domainEventProcessor, config.cron.processDomainEventsJob),
    cleanupOrphanImages: new CleanupOrphanImagesJob(orphanImageCleaner, config.cron.cleanupOrphanImagesJob),
    cleanupDomainEvents: new CleanupDomainEventsJob(domainEventCleaner, config.cron.cleanupDomainEventsJob)
  }
}

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
function createInstances(): Instances {
  const mappers = createMappers()
  const dataAccess = createDataAccessLayer()
  const repositories = createRepositories(dataAccess.dataAccessProvider, dataAccess.helpers, mappers)

  const passwordFactory = new PasswordFactory(process.env.NODE_ENV === 'dev' ? new DevelopmentPasswordPolicy() : new StrictPasswordPolicy())
  const services = createServices(mappers, repositories, repositories.domainEvent, passwordFactory)
  const { useCaseFactory, tokenService } = createUseCaseFactories(mappers, repositories, services, passwordFactory)

  const cronJobs = createCronJobs(repositories.domainEvent, mappers, dataAccess.eventDispatcher, repositories)

  return {
    mappers,
    services,
    repositories,
    factories: { useCase: useCaseFactory },
    cronJobs,
    eventDispatcher: dataAccess.eventDispatcher,
    eventHandlerRegistry: dataAccess.eventHandlerRegistry,
    authentication: new Authentication(passport, repositories.user),
    tokenService
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
