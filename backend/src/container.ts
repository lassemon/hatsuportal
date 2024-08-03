import { container } from 'tsyringe'
import { IocContainer, IocContainerFactory } from 'tsoa'
import passport from 'passport'
import express from 'express'
import config from './config'
import { IUserToRequesterMapper, UserToRequesterMapper, ITransactionManager, IHttpErrorMapper, ICronJob } from '@hatsuportal/platform'
import {
  DomainEventDispatcher,
  IDomainEventDispatcher,
  IDomainEventHandlerRegistry,
  UniqueId,
  UnixTimestamp
} from '@hatsuportal/shared-kernel'

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
  PasswordFactory,
  StrictPasswordPolicy,
  DevelopmentPasswordPolicy,
  IProfileApiMapper,
  IAuthApiMapper,
  IUserApiMapper,
  UserApiMapper,
  ProfileApiMapper,
  AuthApiMapper,
  UserRepository
} from '@hatsuportal/user-management'

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
  IPostAuthorizationService,
  PostAuthorizationService,
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
  TagRepository
} from '@hatsuportal/post-management'

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
  StorageKeyGenerator as MediaStorageKeyGenerator
} from '@hatsuportal/media-management'

import { DomainEventHandlerRegistry } from './infrastructure/services/DomainEventHandlerRegistry'
import { DomainEventProcessor } from './infrastructure/services/DomainEventProcessor'
import { DomainEventCleaner } from './infrastructure/services/DomainEventCleaner'
import { OrphanImageCleaner } from './infrastructure/services/OrphanImageCleaner'
import { IUseCaseFactory, UseCaseFactory } from './infrastructure/services/UseCaseFactory'
import { UnitOfWork } from './infrastructure/dataAccess/database/UnitOfWork'
import { HttpErrorMapper } from './infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import connection from './infrastructure/dataAccess/database/connection'
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

// test connection, fail early
connection.getConnection()

interface Instances {
  mappers: {
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
  }
  services: {
    imageProcessing: IImageProcessingService
    imageStorage: IImageStorageService
    imageFile: IImageFileService
    user: IUserAuthenticationService
    transactionManager: ITransactionManager<UniqueId, UnixTimestamp>
    postAuthorizationService: IPostAuthorizationService
    mediaAuthorizationService: IMediaAuthorizationService
    userAuthorizationService: IUserAuthorizationService
  }
  repositories: {
    postRead: IPostReadRepository
    image: IImageRepository
    storyRead: IStoryReadRepository
    storyWrite: IStoryWriteRepository
    commentRead: ICommentReadRepository
    commentWrite: ICommentWriteRepository
    user: IUserRepository
    tag: ITagRepository
  }
  factories: {
    useCase: IUseCaseFactory
  }
  cronJobs: {
    processDomainEvents: ICronJob
    cleanupOrphanImages: ICronJob
    cleanupDomainEvents: ICronJob
  }
  eventDispatcher: IDomainEventDispatcher<UnixTimestamp>
  eventHandlerRegistry: IDomainEventHandlerRegistry
  domainEventProcessor: DomainEventProcessor
  domainEventCleaner: DomainEventCleaner
  orphanImageCleaner: OrphanImageCleaner
  authentication: IAuthentication
  tokenService: TokenService
}

export function configureContainer() {
  try {
    const instances = createInstances()

    registerMappers(instances)
    registerFactories(instances)
    registerAuthentication(instances)
    registerCronJobs(instances)

    return container
  } catch (error) {
    throw new Error(`Failed to configure dependency container: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function createInstances(): Instances {
  const imageApplicationMapper = new ImageApplicationMapper()
  const commentApiMapper = new CommentApiMapper()
  const mappers = {
    postInfrastructure: new PostInfrastructureMapper(),
    imageInfrastructure: new ImageInfrastructureMapper(),
    storyInfrastructure: new StoryInfrastructureMapper(),
    commentInfrastructure: new CommentInfrastructureMapper(),
    userInfrastructure: new UserInfrastructureMapper(),
    tagApplication: new TagApplicationMapper(),
    tagInfrastructure: new TagInfrastructureMapper(),
    commentApplication: new CommentApplicationMapper(),
    imageApplication: imageApplicationMapper,
    storyApplication: new StoryApplicationMapper(),
    userApplication: new UserApplicationMapper(),
    imageApi: new ImageApiMapper(),
    storyApi: new StoryApiMapper(),
    commentApi: commentApiMapper,
    userApi: new UserApiMapper(),
    profileApi: new ProfileApiMapper(),
    errorApi: new HttpErrorMapper(),
    authApi: new AuthApiMapper(),
    tagApi: new TagApiMapper(),
    userToRequesterMapper: new UserToRequesterMapper()
  }
  const eventDispatcher = new DomainEventDispatcher()
  const eventHandlerRegistry = new DomainEventHandlerRegistry(eventDispatcher)
  const domainEventInfrastructureMapper = new DomainEventInfrastructureMapper()

  const knex = connection.getConnection()
  const dataAccessProvider = new KnexDataAccessProvider(knex)
  const helpers = new PostgresRepositoryHelpers()

  const userRepository = new UserRepository(dataAccessProvider, helpers, mappers.userInfrastructure)

  const domainEventRepository = new DomainEventRepository(dataAccessProvider, helpers, domainEventInfrastructureMapper)

  const passwordFactory = new PasswordFactory(process.env.NODE_ENV === 'dev' ? new DevelopmentPasswordPolicy() : new StrictPasswordPolicy())

  const imageProcessingService = new ImageProcessingService()
  const imageStorageService = new ImageStorageService()
  const services = {
    imageProcessing: imageProcessingService,
    imageStorage: imageStorageService,
    imageFile: new ImageFileService(imageProcessingService, imageStorageService),
    user: new UserAuthenticationService(userRepository, passwordFactory),
    transactionManager: new UnitOfWork(domainEventRepository, connection),
    mediaStorageKeyGenerator: new MediaStorageKeyGenerator(),
    postAuthorizationService: new PostAuthorizationService(mappers.commentApplication, mappers.userToRequesterMapper),
    mediaAuthorizationService: new MediaAuthorizationService(mappers.userToRequesterMapper),
    userAuthorizationService: new UserAuthorizationService(mappers.userToRequesterMapper)
  }

  const postWriteRepository = new PostWriteRepository(dataAccessProvider, helpers)
  const repositories = {
    image: new ImageRepository(
      dataAccessProvider,
      helpers,
      mappers.imageInfrastructure,
      services.imageFile,
      config.images.versionRetentionCount
    ),
    postRead: new PostReadRepository(dataAccessProvider, helpers, mappers.postInfrastructure),
    storyRead: new StoryReadRepository(dataAccessProvider, helpers, mappers.storyInfrastructure),
    storyWrite: new StoryWriteRepository(
      dataAccessProvider,
      helpers,
      mappers.postInfrastructure,
      mappers.storyInfrastructure,
      postWriteRepository
    ),
    commentRead: new CommentReadRepository(
      {
        defaultRepliesPreviewLimit: config.comment.defaultRepliesPreviewLimit,
        defaultRepliesSortOrder: config.comment.defaultRepliesSortOrder
      },
      dataAccessProvider,
      helpers,
      mappers.commentInfrastructure
    ),
    commentWrite: new CommentWriteRepository(dataAccessProvider, helpers, mappers.commentInfrastructure),
    user: userRepository,
    tag: new TagRepository(dataAccessProvider, helpers, mappers.tagInfrastructure)
  }

  const authentication = new Authentication(passport, repositories.user)
  const tokenService = new TokenService()

  const factories = {
    useCase: new UseCaseFactory(
      // post management
      services.postAuthorizationService,
      repositories.postRead,
      repositories.storyRead,
      repositories.storyWrite,
      mappers.storyApplication,
      repositories.commentRead,
      repositories.commentWrite,
      repositories.tag,
      mappers.tagApplication,
      // media management
      services.mediaAuthorizationService,
      repositories.image,
      mappers.imageApplication,
      services.mediaStorageKeyGenerator,
      // user management
      services.userAuthorizationService,
      repositories.user,
      mappers.userApplication,
      services.user,
      tokenService,
      // general
      services.transactionManager,
      passwordFactory
    )
  }

  const processingLock = new PostgresAdvisoryLock(connection, 100100)
  const cleanupLock = new PostgresAdvisoryLock(connection, 100101)
  const domainEventCleanupLock = new PostgresAdvisoryLock(connection, 100102)
  const domainEventProcessor = new DomainEventProcessor(
    domainEventRepository,
    domainEventInfrastructureMapper,
    eventDispatcher,
    processingLock
  )
  const orphanImageCleaner = new OrphanImageCleaner(repositories.image, config.images.basePath, config.images.orphanMaxAgeMs, cleanupLock)
  const domainEventCleaner = new DomainEventCleaner(domainEventRepository, config.domainEvents.maxAgeSeconds, domainEventCleanupLock)
  const cronJobs = {
    processDomainEvents: new ProcessDomainEventsJob(domainEventProcessor, config.cron.processDomainEventsJob),
    cleanupOrphanImages: new CleanupOrphanImagesJob(orphanImageCleaner, config.cron.cleanupOrphanImagesJob),
    cleanupDomainEvents: new CleanupDomainEventsJob(domainEventCleaner, config.cron.cleanupDomainEventsJob)
  }

  return {
    mappers,
    services,
    repositories,
    factories,
    cronJobs,
    eventDispatcher,
    eventHandlerRegistry,
    domainEventProcessor,
    domainEventCleaner,
    orphanImageCleaner,
    authentication,
    tokenService
  }
}

function registerMappers(instances: Instances) {
  container.register('IImageApiMapper', { useValue: instances.mappers.imageApi })
  container.register('IStoryApiMapper', { useValue: instances.mappers.storyApi })
  container.register('ICommentApiMapper', { useValue: instances.mappers.commentApi })
  container.register('IUserApiMapper', { useValue: instances.mappers.userApi })
  container.register('IUserApplicationMapper', { useValue: instances.mappers.userApplication })
  container.register('IProfileApiMapper', { useValue: instances.mappers.profileApi })
  container.register('IAuthApiMapper', { useValue: instances.mappers.authApi })
  container.register('IHttpErrorMapper', { useValue: instances.mappers.errorApi })
  container.register('ITagApiMapper', { useValue: instances.mappers.tagApi })
}

function registerFactories(instances: Instances) {
  container.register('IUseCaseFactory', { useValue: instances.factories.useCase })
}

function registerAuthentication(instances: Instances) {
  container.register('IAuthentication', { useValue: instances.authentication })
}

function registerCronJobs(instances: Instances) {
  container.register('ICronJob', { useValue: instances.cronJobs.processDomainEvents })
  container.register('ICronJob', { useValue: instances.cronJobs.cleanupOrphanImages })
  container.register('ICronJob', { useValue: instances.cronJobs.cleanupDomainEvents })
}

// TODO put this in a separate file
const iocContainer: IocContainerFactory = function (request: express.Request): IocContainer {
  return {
    get: <T>(controller: { prototype: T }): T => {
      return container.resolve<T>(controller as never)
    }
  }
}

export { iocContainer }
