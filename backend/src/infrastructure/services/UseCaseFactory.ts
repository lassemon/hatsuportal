import { Authorization } from '/infrastructure'

import {
  ICreateImageUseCase,
  IFindImageUseCase,
  IImageApplicationMapper,
  IUpdateImageUseCase,
  IImageRepository,
  IImageFileService,
  ITransactionManager,
  ErrorHandlingUseCaseDecorator
} from '@hatsuportal/common-bounded-context'

import {
  ICreateStoryUseCase,
  IDeleteStoryUseCase,
  IFindStoryUseCase,
  IFindMyStoriesUseCase,
  IStoryApplicationMapper,
  IRemoveImageFromStoryUseCase,
  ISearchStoriesUseCase,
  IUpdateStoryUseCase,
  IUseCaseFactory as IPostUseCaseFactory,
  IStoryRepository
} from '@hatsuportal/post-management'

import {
  IUserRepository,
  IUserService,
  ILoginUserUseCase,
  IRefreshTokenUseCase,
  ICreateUserUseCase,
  IDeactivateUserUseCase,
  IFindUserUseCase,
  IGetAllUsersUseCase,
  IGetUserProfileUseCase,
  IUpdateUserUseCase,
  IUserApplicationMapper,
  IUseCaseFactory as IUserUseCaseFactory
} from '@hatsuportal/user-management'

import { CreateImageUseCase, CreateImageUseCaseWithValidation } from '../../useCases/image/CreateImageUseCase'
import { CreateStoryUseCase, CreateStoryUseCaseWithValidation } from '../../useCases/story/CreateStoryUseCase'
import { CreateUserUseCase, CreateUserUseCaseWithValidation } from '../../useCases/user/CreateUserUseCase'
import { DeactivateUserUseCase, DeadtivateUserUseCaseWithValidation } from '../../useCases/user/DeactivateUserUseCase'
import { DeleteStoryUseCase, DeleteStoryUseCaseWithValidation } from '../../useCases/story/DeleteStoryUseCase'
import { FindImageUseCase, FindImageUseCaseWithValidation } from '../../useCases/image/FindImageUseCase'
import { FindMyStoriesUseCase, FindMyStoriesUseCaseWithValidation } from '../../useCases/story/FindMyStoriesUseCase'
import { FindStoryUseCase, FindStoryUseCaseWithValidation } from '../../useCases/story/FindStoryUseCase'
import { FindUserUseCase, FindUserUseCaseWithValidation } from '../../useCases/user/FindUserUseCase'
import { GetAllUsersUseCase, GetAllUsersUseCaseWithValidation } from '../../useCases/user/GetAllUsersUseCase'
import { GetUserProfileUseCase } from '../../useCases/profile/GetUserProfileUseCase/GetUserProfileUseCase'
import { LoginUserUseCase, LoginUserUseCaseWithValidation } from '../../useCases/auth/LoginUserUseCase'
import { RefreshTokenUseCase, RefreshTokenUseCaseWithValidation } from '../../useCases/auth/RefreshTokenUseCase'
import { RemoveImageFromStoryUseCase, RemoveImageFromStoryUseCaseWithValidation } from '../../useCases/story/RemoveImageFromStoryUseCase'
import { SearchStoriesUseCase, SearchStoriesUseCaseWithValidation } from '../../useCases/story/SearchStoriesUseCase'
import { UpdateImageUseCase, UpdateImageUseCaseWithValidation } from '../../useCases/image/UpdateImageUseCase'
import { UpdateStoryUseCase, UpdateStoryUseCaseWithValidation } from '../../useCases/story/UpdateStoryUseCase'
import { UpdateUserUseCase, UpdateUserUseCaseWithValidation } from '../../useCases/user/UpdateUserUseCase'
import { IAuthorizationService } from '../auth/services/AuthorizationService'

/*
 * Importing cached versions of repositories here instead of dependency injection
 * because this is where the requestContext (i.e. use case) starts and is a logical place to decide
 * if we want to use cached repositories or not, the IoC container does not have to know about it.
 */
import { UserRepositoryWithCache } from '../repositories/UserRepositoryWithCache'
import { StoryRepositoryWithCache } from '../repositories/StoryRepositoryWithCache'
import { ImageRepositoryWithCache } from '../repositories/ImageRepositoryWithCache'

export class UseCaseFactory implements IPostUseCaseFactory, IUserUseCaseFactory {
  constructor(
    private readonly transactionManager: ITransactionManager,
    private readonly userRepository: IUserRepository,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userService: IUserService,
    private readonly storyRepository: IStoryRepository,
    private readonly storyApplicationMapper: IStoryApplicationMapper,
    private readonly imageRepository: IImageRepository,
    private readonly imageFileService: IImageFileService,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly authorization: Authorization,
    private readonly authorizationService: IAuthorizationService
  ) {}

  // auth
  createLoginUserUseCase(): ILoginUserUseCase {
    return new LoginUserUseCaseWithValidation(new LoginUserUseCase(this.userApplicationMapper, this.userRepository, this.authorization))
  }

  createRefreshTokenUseCase(): IRefreshTokenUseCase {
    return new RefreshTokenUseCaseWithValidation(new RefreshTokenUseCase(this.userRepository, this.authorization))
  }

  // user
  createCreateUserUseCase(): ICreateUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new CreateUserUseCaseWithValidation(
        new CreateUserUseCase(userRepositoryWithCache, this.userApplicationMapper, this.transactionManager),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new UpdateUserUseCaseWithValidation(
        new UpdateUserUseCase(userRepositoryWithCache, this.userApplicationMapper, this.userService),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new DeadtivateUserUseCaseWithValidation(
        new DeactivateUserUseCase(userRepositoryWithCache, this.userApplicationMapper, this.transactionManager),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createFindUserUseCase(): IFindUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new FindUserUseCaseWithValidation(
        new FindUserUseCase(userRepositoryWithCache, this.userApplicationMapper),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createGetAllUsersUseCase(): IGetAllUsersUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new GetAllUsersUseCaseWithValidation(
        new GetAllUsersUseCase(userRepositoryWithCache, this.userApplicationMapper),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  // story
  createCreateStoryUseCase(): ICreateStoryUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new CreateStoryUseCaseWithValidation(
        new CreateStoryUseCase(
          userRepositoryWithCache,
          this.imageRepository,
          this.storyRepository,
          this.storyApplicationMapper,
          this.transactionManager
        ),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createUpdateStoryUseCase(): IUpdateStoryUseCase {
    const storyRepositoryWithCache = new StoryRepositoryWithCache(this.storyRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new UpdateStoryUseCaseWithValidation(
        new UpdateStoryUseCase(this.imageRepository, storyRepositoryWithCache, this.storyApplicationMapper, this.transactionManager),
        this.userRepository,
        storyRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createDeleteStoryUseCase(): IDeleteStoryUseCase {
    const storyRepositoryWithCache = new StoryRepositoryWithCache(this.storyRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new DeleteStoryUseCaseWithValidation(
        new DeleteStoryUseCase(this.imageRepository, storyRepositoryWithCache, this.storyApplicationMapper, this.transactionManager),
        this.userRepository,
        storyRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createSearchStoriesUseCase(): ISearchStoriesUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new SearchStoriesUseCaseWithValidation(
        new SearchStoriesUseCase(this.storyRepository, userRepositoryWithCache, this.storyApplicationMapper),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createFindStoryUseCase(): IFindStoryUseCase {
    const storyRepositoryWithCache = new StoryRepositoryWithCache(this.storyRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new FindStoryUseCaseWithValidation(
        new FindStoryUseCase(storyRepositoryWithCache, this.storyApplicationMapper),
        this.userRepository,
        storyRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createFindMyStoriesUseCase(): IFindMyStoriesUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new FindMyStoriesUseCaseWithValidation(
        new FindMyStoriesUseCase(this.storyRepository, this.storyApplicationMapper),
        userRepositoryWithCache
      )
    )
  }

  // image
  createCreateImageUseCase(): ICreateImageUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new CreateImageUseCaseWithValidation(
        new CreateImageUseCase(userRepositoryWithCache, this.imageRepository, this.imageApplicationMapper, this.transactionManager),
        userRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const imageRepositoryWithCache = new ImageRepositoryWithCache(this.imageRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new UpdateImageUseCaseWithValidation(
        new UpdateImageUseCase(userRepositoryWithCache, imageRepositoryWithCache, this.imageApplicationMapper),
        userRepositoryWithCache,
        imageRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createRemoveImageFromStoryUseCase(): IRemoveImageFromStoryUseCase {
    const storyRepositoryWithCache = new StoryRepositoryWithCache(this.storyRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new RemoveImageFromStoryUseCaseWithValidation(
        new RemoveImageFromStoryUseCase(
          storyRepositoryWithCache,
          this.imageRepository,
          this.storyApplicationMapper,
          this.transactionManager
        ),
        this.userRepository,
        storyRepositoryWithCache,
        this.authorizationService
      )
    )
  }

  createFindImageUseCase(): IFindImageUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindImageUseCaseWithValidation(new FindImageUseCase(this.imageRepository, this.imageFileService, this.imageApplicationMapper))
    )
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return new ErrorHandlingUseCaseDecorator(new GetUserProfileUseCase(this.storyRepository))
  }
}
