import { IStoryRepository, IUseCaseFactory as IPostUseCaseFactory, IStoryApplicationMapper } from '@hatsuportal/post-management'
import {
  IUserRepository,
  User,
  IUseCaseFactory as IUserUseCaseFactory,
  IUserService,
  IUserApplicationMapper
} from '@hatsuportal/user-management'
import { IImageApplicationMapper, IUseCaseFactory } from '@hatsuportal/common-bounded-context'
import { Controller } from 'tsoa'
import { Authentication, Authorization } from '/infrastructure'
import { TsoaRequest } from '/infrastructure/TsoaRequest'
import { container } from 'tsyringe'
import { IDomainEventDispatcher, IImageRepository, IImageFileService } from '@hatsuportal/common-bounded-context'
import { AuthenticationError } from '@hatsuportal/common-bounded-context'

type UseCaseFactory = IPostUseCaseFactory & IUserUseCaseFactory & IUseCaseFactory

export class RootController extends Controller {
  public static readonly authentication: Authentication = container.resolve('Authentication')
  protected readonly eventDispatcher: IDomainEventDispatcher
  protected readonly userRepository: IUserRepository
  protected readonly storyRepository: IStoryRepository
  protected readonly imageRepository: IImageRepository
  protected readonly imageFileService: IImageFileService
  protected readonly userService: IUserService
  protected readonly authorization: Authorization
  protected readonly imageApplicationMapper: IImageApplicationMapper
  protected readonly storyApplicationMapper: IStoryApplicationMapper
  protected readonly userApplicationMapper: IUserApplicationMapper
  protected readonly useCaseFactory: UseCaseFactory

  constructor() {
    super()
    // TODO, which of these are actually needed?
    this.eventDispatcher = container.resolve('IDomainEventDispatcher')
    this.userRepository = container.resolve('IUserRepository')
    this.storyRepository = container.resolve('IStoryRepository')
    this.imageRepository = container.resolve('IImageRepository')
    this.imageFileService = container.resolve('IImageFileService')
    this.userService = container.resolve('IUserService')
    this.authorization = container.resolve('Authorization')
    this.imageApplicationMapper = container.resolve('IImageApplicationMapper')
    this.storyApplicationMapper = container.resolve('IStoryApplicationMapper')
    this.userApplicationMapper = container.resolve('IUserApplicationMapper')
    this.useCaseFactory = container.resolve('IUseCaseFactory')
  }

  validateAuthentication(request: TsoaRequest): asserts request is TsoaRequest & { user: User } {
    if (!request.user || !request?.isAuthenticated()) {
      throw new AuthenticationError('Must be logged in to do that.')
    }
  }
}
