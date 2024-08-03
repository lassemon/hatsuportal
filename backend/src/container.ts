import { container } from 'tsyringe'
import { DomainEventDispatcher } from './infrastructure/services/DomainEventDispatcher'
import { DomainEventHandlerRegistry } from './infrastructure/services/DomainEventHandlerRegistry'
import { Authentication, Authorization, connection, ImageRepository, StoryRepository, UserRepository } from '/infrastructure'
import { ImageService, ImageProcessingService, ImageStorageService } from '/infrastructure'
import { ImageInfrastructureMapper, StoryInfrastructureMapper, UserInfrastructureMapper, UserService } from '@hatsuportal/infrastructure'
import { ImageApplicationMapper, StoryApplicationMapper, UserApplicationMapper } from '@hatsuportal/application'
import { UnitOfWorkFactory } from './infrastructure/services/UnitOfWorkFactory'
import { UseCaseFactory } from './infrastructure/services/UseCaseFactory'
import { IocContainer, IocContainerFactory } from 'tsoa'
import { ErrorPresentationMapper, ImagePresentationMapper, StoryPresentationMapper } from '@hatsuportal/presentation'
import passport from 'passport'
import express from 'express'

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
    errorPresentation: ErrorPresentationMapper
  }
  services: {
    imageProcessing: ImageProcessingService
    imageStorage: ImageStorageService
    image: ImageService
    user: UserService
  }
  repositories: {
    image: ImageRepository
    story: StoryRepository
    user: UserRepository
  }
  factories: {
    unitOfWork: UnitOfWorkFactory
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
    errorPresentation: new ErrorPresentationMapper()
  }

  const userRepository = new UserRepository()

  const imageProcessingService = new ImageProcessingService()
  const imageStorageService = new ImageStorageService()
  const services = {
    imageProcessing: imageProcessingService,
    imageStorage: imageStorageService,
    image: new ImageService(imageProcessingService, imageStorageService),
    user: new UserService(userRepository)
  }

  const imageRepository = new ImageRepository(mappers.imageInfrastructure, services.image)
  const repositories = {
    image: new ImageRepository(mappers.imageInfrastructure, services.image),
    story: new StoryRepository(imageRepository, mappers.storyInfrastructure),
    user: userRepository
  }

  const authentication = new Authentication(passport)
  const authorization = new Authorization()

  const eventDispatcher = new DomainEventDispatcher()
  const eventHandlerRegistry = new DomainEventHandlerRegistry(eventDispatcher, repositories.story, repositories.image)

  const unitOfWorkFactory = new UnitOfWorkFactory(connection, repositories.story, repositories.image, eventDispatcher)
  const factories = {
    unitOfWork: unitOfWorkFactory,
    useCase: new UseCaseFactory(
      unitOfWorkFactory,
      repositories.user,
      mappers.userApplication,
      services.user,
      repositories.story,
      mappers.storyApplication,
      repositories.image,
      services.image,
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
  container.register('IErrorPresentationMapper', { useValue: instances.mappers.errorPresentation })
}

function registerServices(instances: Instances) {
  container.register('IImageProcessingService', { useValue: instances.services.imageProcessing })
  container.register('IImageStorageService', { useValue: instances.services.imageStorage })
  container.register('IImageService', { useValue: instances.services.image })
  container.register('IUserService', { useValue: instances.services.user })
}

function registerRepositories(instances: Instances) {
  container.register('IImageRepository', { useValue: instances.repositories.image })
  container.register('IStoryRepository', { useValue: instances.repositories.story })
  container.register('IUserRepository', { useValue: instances.repositories.user })
}

function registerFactories(instances: Instances) {
  container.register('IUnitOfWorkFactory', { useValue: instances.factories.unitOfWork })
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
