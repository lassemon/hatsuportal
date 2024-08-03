import { IImageRepository, IStoryRepository, IUserRepository, User } from '@hatsuportal/domain'
import { Controller } from 'tsoa'
import {
  IUseCaseFactory,
  AuthenticationError,
  IImageService,
  IUserService,
  IImageApplicationMapper,
  IStoryApplicationMapper,
  IUserApplicationMapper,
  IUnitOfWorkFactory
} from '@hatsuportal/application'
import { Authentication, Authorization } from '/infrastructure'
import { TsoaRequest } from '/presentation/api/requests/TsoaRequest'
import { IDomainEventDispatcher } from '@hatsuportal/application'
import { container } from 'tsyringe'

export class RootController extends Controller {
  public static readonly authentication: Authentication = container.resolve('Authentication')
  protected readonly eventDispatcher: IDomainEventDispatcher
  protected readonly userRepository: IUserRepository
  protected readonly storyRepository: IStoryRepository
  protected readonly imageRepository: IImageRepository
  protected readonly imageService: IImageService
  protected readonly userService: IUserService
  protected readonly authorization: Authorization
  protected readonly imageApplicationMapper: IImageApplicationMapper
  protected readonly storyApplicationMapper: IStoryApplicationMapper
  protected readonly userApplicationMapper: IUserApplicationMapper
  protected readonly unitOfWorkFactory: IUnitOfWorkFactory
  protected readonly useCaseFactory: IUseCaseFactory

  constructor() {
    super()
    // TODO, which of these are actually needed?
    this.eventDispatcher = container.resolve('IDomainEventDispatcher')
    this.userRepository = container.resolve('IUserRepository')
    this.storyRepository = container.resolve('IStoryRepository')
    this.imageRepository = container.resolve('IImageRepository')
    this.imageService = container.resolve('IImageService')
    this.userService = container.resolve('IUserService')
    this.authorization = container.resolve('Authorization')
    this.imageApplicationMapper = container.resolve('IImageApplicationMapper')
    this.storyApplicationMapper = container.resolve('IStoryApplicationMapper')
    this.userApplicationMapper = container.resolve('IUserApplicationMapper')
    this.unitOfWorkFactory = container.resolve('IUnitOfWorkFactory')
    this.useCaseFactory = container.resolve('IUseCaseFactory')
  }

  validateAuthentication(request: TsoaRequest): asserts request is TsoaRequest & { user: User } {
    if (!request.user || !request?.isAuthenticated()) {
      throw new AuthenticationError('Must be logged in to do that.')
    }
  }
}
