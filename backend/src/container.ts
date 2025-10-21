import { container } from 'tsyringe'
import { IocContainer, IocContainerFactory } from 'tsoa'
import passport from 'passport'
import express from 'express'

import {
  IDomainEventDispatcher,
  IDomainEventHandlerRegistry,
  ITransactionManager,
  IUserToRequesterMapper,
  UserToRequesterMapper
} from '@hatsuportal/foundation'
import { UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'

import {
  IUserInfrastructureMapper,
  IUserApplicationMapper,
  IUserFactory,
  IUserRepository,
  IUserService,
  UserApplicationMapper,
  UserInfrastructureMapper,
  UserService,
  UserFactory,
  IUserAuthorizationService,
  UserAuthorizationService
} from '@hatsuportal/user-management'

import {
  IStoryApplicationMapper,
  IStoryReadRepository,
  IStoryWriteRepository,
  IStoryFactory,
  StoryInfrastructureMapper,
  StoryApplicationMapper,
  StoryFactory,
  IStoryInfrastructureMapper,
  ITagRepository,
  ITagApplicationMapper,
  TagApplicationMapper,
  IPostInfrastructureMapper,
  IPostWriteRepository,
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
  TagInfrastructureMapper
} from '@hatsuportal/post-management'

import {
  IImageApplicationMapper,
  IImageFactory,
  IImageFileService,
  IImageInfrastructureMapper,
  IImageProcessingService,
  IImageRepository,
  IImageStorageService,
  ImageApplicationMapper,
  ImageFactory,
  ImageInfrastructureMapper,
  IMediaAuthorizationService,
  MediaAuthorizationService,
  StorageKeyGenerator as MediaStorageKeyGenerator
} from '@hatsuportal/media-management'

import { IImageApiMapper } from './application/dataAccess/http/mappers/IImageApiMapper'
import { IStoryApiMapper } from './application/dataAccess/http/mappers/IStoryApiMapper'
import { IUserApiMapper } from './application/dataAccess/http/mappers/IUserApiMapper'
import { IAuthApiMapper } from './application/dataAccess/http/mappers/IAuthApiMapper'
import { ICommentApiMapper } from './application/dataAccess/http/mappers/ICommentApiMapper'
import { IProfileApiMapper } from './application/dataAccess/http/mappers/IProfileApiMapper'
import { ITagApiMapper } from './application/dataAccess/http/mappers/ITagApiMapper'
import { IHttpErrorMapper } from './application/dataAccess'

import { DomainEventDispatcher } from './infrastructure/services/DomainEventDispatcher'
import { DomainEventHandlerRegistry } from './infrastructure/services/DomainEventHandlerRegistry'
import { ImageRepository, StoryReadRepository, StoryWriteRepository, UserRepository } from './infrastructure/repositories'
import { ImageFileService, ImageProcessingService, ImageStorageService } from './infrastructure/services'
import { IUseCaseFactory, UseCaseFactory } from './infrastructure/services/UseCaseFactory'
import { TransactionManager } from './infrastructure/dataAccess/database/TransactionManager'
import { ImageApiMapper } from './infrastructure/dataAccess/http/mappers/ImageApiMapper'
import { ProfileApiMapper } from './infrastructure/dataAccess/http/mappers/ProfileApiMapper'
import { HttpErrorMapper } from './infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import { UserApiMapper } from './infrastructure/dataAccess/http/mappers/UserApiMapper'
import { StoryApiMapper } from './infrastructure/dataAccess/http/mappers/StoryApiMapper'
import { AuthApiMapper } from './infrastructure/dataAccess/http/mappers/AuthApiMapper'
import { TagRepository } from './infrastructure/repositories/TagRepository'
import { TagApiMapper } from './infrastructure/dataAccess/http/mappers/TagApiMapper'
import { PostWriteRepository } from './infrastructure/repositories/PostWriteRepository'
import { CommentApiMapper } from './infrastructure/dataAccess/http/mappers/CommentApiMapper'
import { CommentReadRepository } from './infrastructure/repositories/CommentReadRepository'
import { PostReadRepository } from './infrastructure/repositories/PostReadRepository'
import { CommentWriteRepository } from './infrastructure/repositories/CommentWriteRepository'
import connection from './infrastructure/dataAccess/database/connection'
import { Authentication } from './infrastructure/auth/Authentication'
import { TokenService } from './infrastructure/auth/TokenService'

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
    user: IUserService
    transactionManager: ITransactionManager<UniqueId, UnixTimestamp>
    postAuthorizationService: IPostAuthorizationService
    mediaAuthorizationService: IMediaAuthorizationService
    userAuthorizationService: IUserAuthorizationService
  }
  repositories: {
    postRead: IPostReadRepository
    postWrite: IPostWriteRepository
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
    user: IUserFactory
    story: IStoryFactory
    image: IImageFactory
  }
  eventDispatcher: IDomainEventDispatcher<UnixTimestamp>
  eventHandlerRegistry: IDomainEventHandlerRegistry
  authentication: Authentication
  tokenService: TokenService
}

export function configureContainer() {
  try {
    const instances = createInstances()

    registerMappers(instances)
    registerServices(instances)
    registerRepositories(instances)
    registerFactories(instances)
    registerEventHandling(instances)
    registerAuthentication(instances)

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
    userApplication: new UserApplicationMapper(new UserFactory()),
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

  // TODO, should the connection be passed from here to all repositories?
  const userRepository = new UserRepository(mappers.userInfrastructure)

  const imageProcessingService = new ImageProcessingService()
  const imageStorageService = new ImageStorageService()
  const services = {
    imageProcessing: imageProcessingService,
    imageStorage: imageStorageService,
    imageFile: new ImageFileService(imageProcessingService, imageStorageService),
    user: new UserService(userRepository),
    transactionManager: new TransactionManager(connection, eventDispatcher),
    mediaStorageKeyGenerator: new MediaStorageKeyGenerator(),
    postAuthorizationService: new PostAuthorizationService(mappers.commentApplication, mappers.userToRequesterMapper),
    mediaAuthorizationService: new MediaAuthorizationService(mappers.userToRequesterMapper),
    userAuthorizationService: new UserAuthorizationService(mappers.userToRequesterMapper)
  }

  const postWriteRepository = new PostWriteRepository()
  const repositories = {
    image: new ImageRepository(mappers.imageInfrastructure, services.imageFile),
    postRead: new PostReadRepository(mappers.postInfrastructure),
    postWrite: postWriteRepository,
    storyRead: new StoryReadRepository(mappers.storyInfrastructure),
    storyWrite: new StoryWriteRepository(mappers.postInfrastructure, mappers.storyInfrastructure, postWriteRepository),
    commentRead: new CommentReadRepository(mappers.commentInfrastructure),
    commentWrite: new CommentWriteRepository(mappers.commentInfrastructure),
    user: userRepository,
    tag: new TagRepository(mappers.tagInfrastructure)
  }

  const authentication = new Authentication(passport, repositories.user)
  const tokenService = new TokenService()

  const storyFactory = new StoryFactory()
  const imageFactory = new ImageFactory()
  const userFactory = new UserFactory()

  const factories = {
    useCase: new UseCaseFactory(
      // post management
      services.postAuthorizationService,
      repositories.postRead,
      repositories.postWrite,
      repositories.storyRead,
      repositories.storyWrite,
      mappers.storyApplication,
      repositories.commentRead,
      repositories.commentWrite,
      mappers.commentApplication,
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
      services.transactionManager
    ),
    user: userFactory,
    story: storyFactory,
    image: imageFactory
  }

  return { mappers, services, repositories, factories, eventDispatcher, eventHandlerRegistry, authentication, tokenService }
}

function registerMappers(instances: Instances) {
  // TODO, are infra and application mappers needed in DI container?
  container.register('IImageInfrastructureMapper', { useValue: instances.mappers.imageInfrastructure })
  container.register('IStoryInfrastructureMapper', { useValue: instances.mappers.storyInfrastructure })
  container.register('ICommentInfrastructureMapper', { useValue: instances.mappers.commentInfrastructure })
  container.register('IUserInfrastructureMapper', { useValue: instances.mappers.userInfrastructure })
  container.register('IImageApplicationMapper', { useValue: instances.mappers.imageApplication })
  container.register('IStoryApplicationMapper', { useValue: instances.mappers.storyApplication })
  container.register('IUserApplicationMapper', { useValue: instances.mappers.userApplication })
  container.register('ITagApplicationMapper', { useValue: instances.mappers.tagApplication })
  container.register('ICommentApplicationMapper', { useValue: instances.mappers.commentApplication })
  container.register('IImageApiMapper', { useValue: instances.mappers.imageApi })
  container.register('IStoryApiMapper', { useValue: instances.mappers.storyApi })
  container.register('ICommentApiMapper', { useValue: instances.mappers.commentApi })
  container.register('IUserApiMapper', { useValue: instances.mappers.userApi })
  container.register('IProfileApiMapper', { useValue: instances.mappers.profileApi })
  container.register('IAuthApiMapper', { useValue: instances.mappers.authApi })
  container.register('IHttpErrorMapper', { useValue: instances.mappers.errorApi })
  container.register('ITagApiMapper', { useValue: instances.mappers.tagApi })
}

function registerServices(instances: Instances) {
  container.register('IImageProcessingService', { useValue: instances.services.imageProcessing })
  container.register('IImageStorageService', { useValue: instances.services.imageStorage })
  container.register('IImageFileService', { useValue: instances.services.imageFile })
  container.register('IUserService', { useValue: instances.services.user })
  container.register('ITransactionManager', { useValue: instances.services.transactionManager })
  container.register('IPostAuthorizationService', { useValue: instances.services.postAuthorizationService })
  container.register('IMediaAuthorizationService', { useValue: instances.services.mediaAuthorizationService })
  container.register('IUserAuthorizationService', { useValue: instances.services.userAuthorizationService })
}

function registerRepositories(instances: Instances) {
  container.register('IImageRepository', { useValue: instances.repositories.image })
  container.register('IStoryReadRepository', { useValue: instances.repositories.storyRead })
  container.register('IStoryWriteRepository', { useValue: instances.repositories.storyWrite })
  container.register('ICommentReadRepository', { useValue: instances.repositories.commentRead })
  container.register('IUserRepository', { useValue: instances.repositories.user })
}

function registerFactories(instances: Instances) {
  container.register('IUseCaseFactory', { useValue: instances.factories.useCase })
  container.register('IUserFactory', { useValue: instances.factories.user })
  container.register('IStoryFactory', { useValue: instances.factories.story })
  container.register('IImageFactory', { useValue: instances.factories.image })
}

function registerEventHandling(instances: Instances) {
  container.register('IDomainEventDispatcher', { useValue: instances.eventDispatcher })
  container.register('IDomainEventHandlerRegistry', { useValue: instances.eventHandlerRegistry })
}

function registerAuthentication(instances: Instances) {
  container.register('Authentication', { useValue: instances.authentication })
  container.register('TokenService', { useValue: instances.tokenService })
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
