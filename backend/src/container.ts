import { container } from 'tsyringe'
import { DomainEventDispatcher } from './infrastructure/services/DomainEventDispatcher'
import { DomainEventHandlerRegistry } from './infrastructure/services/DomainEventHandlerRegistry'
import { Authentication, Authorization, connection, ImageRepository, StoryRepository, UserRepository } from '/infrastructure'
import { ImageFileService, ImageProcessingService, ImageStorageService } from '/infrastructure'
import { StoryInfrastructureMapper, StoryApplicationMapper, StoryFactory } from '@hatsuportal/post-management'
import { ImageFactory } from '@hatsuportal/common-bounded-context'
import { UserApplicationMapper, UserInfrastructureMapper, UserService, UserFactory } from '@hatsuportal/user-management'
import { UseCaseFactory } from './infrastructure/services/UseCaseFactory'
import { IocContainer, IocContainerFactory } from 'tsoa'
import passport from 'passport'
import express from 'express'
import { TransactionManager } from './infrastructure/dataAccess/database/TransactionManager'
import { ImageApplicationMapper, ImageInfrastructureMapper } from '@hatsuportal/common-bounded-context'
import { AuthorizationService } from './infrastructure/auth/services/AuthorizationService'
import { ImageApiMapper } from './infrastructure/dataAccess/http/mappers/ImageApiMapper'
import { ProfileApiMapper } from './infrastructure/dataAccess/http/mappers/ProfileApiMapper'
import { HttpErrorMapper } from './infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import { UserApiMapper } from './infrastructure/dataAccess/http/mappers/UserApiMapper'
import { StoryApiMapper } from './infrastructure/dataAccess/http/mappers/StoryApiMapper'
import { AuthApiMapper } from './infrastructure/dataAccess/http/mappers/AuthApiMapper'

// test connection, fail early
connection.getConnection()

interface Instances {
  mappers: {
    imageInfrastructure: ImageInfrastructureMapper
    storyInfrastructure: StoryInfrastructureMapper
    userInfrastructure: UserInfrastructureMapper
    imageApplication: ImageApplicationMapper
    storyApplication: StoryApplicationMapper
    userApplication: UserApplicationMapper
    imageApi: ImageApiMapper
    storyApi: StoryApiMapper
    userApi: UserApiMapper
    profileApi: ProfileApiMapper
    errorApi: HttpErrorMapper
    authApi: AuthApiMapper
  }
  services: {
    imageProcessing: ImageProcessingService
    imageStorage: ImageStorageService
    imageFile: ImageFileService
    user: UserService
    transactionManager: TransactionManager
    authorizationService: AuthorizationService
  }
  repositories: {
    image: ImageRepository
    story: StoryRepository
    user: UserRepository
  }
  factories: {
    useCase: UseCaseFactory
    user: UserFactory
    story: StoryFactory
    image: ImageFactory
  }
  eventDispatcher: DomainEventDispatcher
  eventHandlerRegistry: DomainEventHandlerRegistry
  authentication: Authentication
  authorization: Authorization
}

export function configureContainer() {
  try {
    const instances = createInstances()

    registerMappers(instances)
    registerServices(instances)
    registerRepositories(instances)
    registerFactories(instances)
    registerEventHandling(instances)
    registerAuthorization(instances)

    return container
  } catch (error) {
    throw new Error(`Failed to configure dependency container: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function createInstances() {
  const imageApplicationMapper = new ImageApplicationMapper(new ImageFactory())
  const mappers = {
    imageInfrastructure: new ImageInfrastructureMapper(),
    storyInfrastructure: new StoryInfrastructureMapper(imageApplicationMapper),
    userInfrastructure: new UserInfrastructureMapper(),
    imageApplication: imageApplicationMapper,
    storyApplication: new StoryApplicationMapper(new StoryFactory()),
    userApplication: new UserApplicationMapper(new UserFactory()),
    imageApi: new ImageApiMapper(),
    storyApi: new StoryApiMapper(),
    userApi: new UserApiMapper(),
    profileApi: new ProfileApiMapper(),
    errorApi: new HttpErrorMapper(),
    authApi: new AuthApiMapper()
  }

  const eventDispatcher = new DomainEventDispatcher()
  const eventHandlerRegistry = new DomainEventHandlerRegistry(eventDispatcher)

  const userRepository = new UserRepository(mappers.userInfrastructure)

  const imageProcessingService = new ImageProcessingService()
  const imageStorageService = new ImageStorageService()
  const services = {
    imageProcessing: imageProcessingService,
    imageStorage: imageStorageService,
    imageFile: new ImageFileService(imageProcessingService, imageStorageService),
    user: new UserService(userRepository),
    transactionManager: new TransactionManager(connection, eventDispatcher),
    authorizationService: new AuthorizationService()
  }

  const imageRepository = new ImageRepository(mappers.imageInfrastructure, services.imageFile)
  const repositories = {
    image: new ImageRepository(mappers.imageInfrastructure, services.imageFile),
    story: new StoryRepository(imageRepository, mappers.storyInfrastructure),
    user: userRepository
  }

  const authentication = new Authentication(passport, repositories.user)
  const authorization = new Authorization()

  const authorizationService = new AuthorizationService()

  const storyFactory = new StoryFactory()
  const imageFactory = new ImageFactory()
  const userFactory = new UserFactory()

  const factories = {
    useCase: new UseCaseFactory(
      services.transactionManager,
      repositories.user,
      mappers.userApplication,
      services.user,
      repositories.story,
      mappers.storyApplication,
      repositories.image,
      services.imageFile,
      mappers.imageApplication,
      authorization,
      authorizationService
    ),
    user: userFactory,
    story: storyFactory,
    image: imageFactory
  }

  return { mappers, services, repositories, factories, eventDispatcher, eventHandlerRegistry, authentication, authorization }
}

function registerMappers(instances: Instances) {
  container.register('IImageInfrastructureMapper', { useValue: instances.mappers.imageInfrastructure })
  container.register('IStoryInfrastructureMapper', { useValue: instances.mappers.storyInfrastructure })
  container.register('IUserInfrastructureMapper', { useValue: instances.mappers.userInfrastructure })
  container.register('IImageApplicationMapper', { useValue: instances.mappers.imageApplication })
  container.register('IStoryApplicationMapper', { useValue: instances.mappers.storyApplication })
  container.register('IUserApplicationMapper', { useValue: instances.mappers.userApplication })
  container.register('IImageApiMapper', { useValue: instances.mappers.imageApi })
  container.register('IStoryApiMapper', { useValue: instances.mappers.storyApi })
  container.register('IUserApiMapper', { useValue: instances.mappers.userApi })
  container.register('IProfileApiMapper', { useValue: instances.mappers.profileApi })
  container.register('IAuthApiMapper', { useValue: instances.mappers.authApi })
  container.register('IHttpErrorMapper', { useValue: instances.mappers.errorApi })
}

function registerServices(instances: Instances) {
  container.register('IImageProcessingService', { useValue: instances.services.imageProcessing })
  container.register('IImageStorageService', { useValue: instances.services.imageStorage })
  container.register('IImageFileService', { useValue: instances.services.imageFile })
  container.register('IUserService', { useValue: instances.services.user })
  container.register('ITransactionManager', { useValue: instances.services.transactionManager })
  container.register('IAuthorizationService', { useValue: instances.services.authorizationService })
}

function registerRepositories(instances: Instances) {
  container.register('IImageRepository', { useValue: instances.repositories.image })
  container.register('IStoryRepository', { useValue: instances.repositories.story })
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

function registerAuthorization(instances: Instances) {
  container.register('Authentication', { useValue: instances.authentication })
  container.register('Authorization', { useValue: instances.authorization })
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
