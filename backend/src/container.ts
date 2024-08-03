import { container } from 'tsyringe'
import { DomainEventDispatcher } from './infrastructure/services/DomainEventDispatcher'
import { DomainEventHandlerRegistry } from './infrastructure/services/DomainEventHandlerRegistry'
import { Authentication, Authorization, connection, ImageRepository, StoryRepository, UserRepository } from '/infrastructure'
import { ImageFileService, ImageProcessingService, ImageStorageService } from '/infrastructure'
import { StoryInfrastructureMapper, StoryApplicationMapper } from '@hatsuportal/post-management'
import { UserApplicationMapper, UserInfrastructureMapper, UserService } from '@hatsuportal/user-management'
import { UseCaseFactory } from './infrastructure/services/UseCaseFactory'
import { IocContainer, IocContainerFactory } from 'tsoa'
import { ErrorPresentationMapper, ImagePresentationMapper } from '@hatsuportal/presentation-common'
import { StoryPresentationMapper } from '@hatsuportal/presentation-post'
import passport from 'passport'
import express from 'express'
import { TransactionManager } from './infrastructure/dataAccess/database/TransactionManager'
import { ImageApplicationMapper, ImageInfrastructureMapper } from '@hatsuportal/common-bounded-context'
import { AuthPresentationMapper, ProfilePresentationMapper, UserPresentationMapper } from '@hatsuportal/presentation-user'

interface Instances {
  mappers: {
    imageInfrastructure: ImageInfrastructureMapper
    storyInfrastructure: StoryInfrastructureMapper
    userInfrastructure: UserInfrastructureMapper
    imageApplication: ImageApplicationMapper
    storyApplication: StoryApplicationMapper
    userApplication: UserApplicationMapper
    imagePresentation: ImagePresentationMapper
    storyPresentation: StoryPresentationMapper
    userPresentation: UserPresentationMapper
    profilePresentation: ProfilePresentationMapper
    errorPresentation: ErrorPresentationMapper
    authPresentation: AuthPresentationMapper
  }
  services: {
    imageProcessing: ImageProcessingService
    imageStorage: ImageStorageService
    imageFile: ImageFileService
    user: UserService
    transactionManager: TransactionManager
  }
  repositories: {
    image: ImageRepository
    story: StoryRepository
    user: UserRepository
  }
  factories: {
    useCase: UseCaseFactory
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
  const mappers = {
    imageInfrastructure: new ImageInfrastructureMapper(),
    storyInfrastructure: new StoryInfrastructureMapper(new ImageApplicationMapper()),
    userInfrastructure: new UserInfrastructureMapper(),
    imageApplication: new ImageApplicationMapper(),
    storyApplication: new StoryApplicationMapper(new ImageApplicationMapper()),
    userApplication: new UserApplicationMapper(),
    imagePresentation: new ImagePresentationMapper(),
    storyPresentation: new StoryPresentationMapper(new ImagePresentationMapper()),
    userPresentation: new UserPresentationMapper(),
    profilePresentation: new ProfilePresentationMapper(),
    errorPresentation: new ErrorPresentationMapper(),
    authPresentation: new AuthPresentationMapper()
  }

  const userRepository = new UserRepository(mappers.userInfrastructure)

  const imageProcessingService = new ImageProcessingService()
  const imageStorageService = new ImageStorageService()
  const services = {
    imageProcessing: imageProcessingService,
    imageStorage: imageStorageService,
    imageFile: new ImageFileService(imageProcessingService, imageStorageService),
    user: new UserService(userRepository),
    transactionManager: new TransactionManager(connection)
  }

  const imageRepository = new ImageRepository(mappers.imageInfrastructure, services.imageFile)
  const repositories = {
    image: new ImageRepository(mappers.imageInfrastructure, services.imageFile),
    story: new StoryRepository(imageRepository, mappers.storyInfrastructure),
    user: userRepository
  }

  const authentication = new Authentication(passport, repositories.user)
  const authorization = new Authorization()

  const eventDispatcher = new DomainEventDispatcher()
  const eventHandlerRegistry = new DomainEventHandlerRegistry(eventDispatcher)

  const factories = {
    useCase: new UseCaseFactory(
      services.transactionManager,
      eventDispatcher,
      repositories.user,
      mappers.userApplication,
      services.user,
      repositories.story,
      mappers.storyApplication,
      repositories.image,
      services.imageFile,
      services.imageStorage,
      mappers.imageApplication,
      authorization
    )
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
  container.register('IImagePresentationMapper', { useValue: instances.mappers.imagePresentation })
  container.register('IStoryPresentationMapper', { useValue: instances.mappers.storyPresentation })
  container.register('IUserPresentationMapper', { useValue: instances.mappers.userPresentation })
  container.register('IProfilePresentationMapper', { useValue: instances.mappers.profilePresentation })
  container.register('IErrorPresentationMapper', { useValue: instances.mappers.errorPresentation })
  container.register('IAuthPresentationMapper', { useValue: instances.mappers.authPresentation })
}

function registerServices(instances: Instances) {
  container.register('IImageProcessingService', { useValue: instances.services.imageProcessing })
  container.register('IImageStorageService', { useValue: instances.services.imageStorage })
  container.register('IImageFileService', { useValue: instances.services.imageFile })
  container.register('IUserService', { useValue: instances.services.user })
  container.register('ITransactionManager', { useValue: instances.services.transactionManager })
}

function registerRepositories(instances: Instances) {
  container.register('IImageRepository', { useValue: instances.repositories.image })
  container.register('IStoryRepository', { useValue: instances.repositories.story })
  container.register('IUserRepository', { useValue: instances.repositories.user })
}

function registerFactories(instances: Instances) {
  container.register('IUseCaseFactory', { useValue: instances.factories.useCase })
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
