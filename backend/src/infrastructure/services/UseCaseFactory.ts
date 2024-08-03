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
  IStoryRepository,
  IStoryFactory
} from '@hatsuportal/post-management'
import { Authorization } from '/infrastructure'

import {
  ICreateImageUseCase,
  IFindImageUseCase,
  IImageApplicationMapper,
  IImageFactory,
  IUpdateImageUseCase
} from '@hatsuportal/common-bounded-context'
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
  IUseCaseFactory as IUserUseCaseFactory,
  IUserFactory
} from '@hatsuportal/user-management'
import { CreateImageUseCase, CreateImageUseCaseWithValidation } from '../../useCases/image/CreateImageUseCase'
import { CreateStoryUseCase, CreateStoryUseCaseWithValidation } from '../../useCases/story/CreateStoryUseCase'
import { CreateUserUseCase, CreateUserUseCaseWithValidation } from '../../useCases/user/CreateUserUseCase'
import { DeactivateUserUseCase, DeadtivateUserUseCaseWithValidation } from '../../useCases/user/DeactivateUserUseCase'
import { DeleteStoryUseCase, DeleteStoryUseCaseWithValidation } from '../../useCases/story/DeleteStoryUseCase'
import { FindImageUseCase } from '../../useCases/image/FindImageUseCase/FindImageUseCase'
import { FindMyStoriesUseCase, FindMyStoriesUseCaseWithValidation } from '../../useCases/story/FindMyStoriesUseCase'
import { FindStoryUseCase, FindStoryUseCaseWithValidation } from '../../useCases/story/FindStoryUseCase'
import { FindUserUseCase } from '../../useCases/user/FindUserUseCase/FindUserUseCase'
import { GetAllUsersUseCase } from '../../useCases/user/GetAllUsersUseCase/GetAllUsersUseCase'
import { GetUserProfileUseCase } from '../../useCases/profile/GetUserProfileUseCase/GetUserProfileUseCase'
import { LoginUserUseCase } from '../../useCases/auth/LoginUserUseCase/LoginUserUseCase'
import { RefreshTokenUseCase } from '../../useCases/auth/RefreshTokenUseCase/RefreshTokenUseCase'
import { RemoveImageFromStoryUseCase } from '../../useCases/story/RemoveImageFromStoryUseCase/RemoveImageFromStoryUseCase'
import { SearchStoriesUseCase, SearchStoriesUseCaseWithValidation } from '../../useCases/story/SearchStoriesUseCase'
import { UpdateImageUseCase, UpdateImageUseCaseWithValidation } from '../../useCases/image/UpdateImageUseCase'
import { UpdateStoryUseCase, UpdateStoryUseCaseWithValidation } from '../../useCases/story/UpdateStoryUseCase'
import { UpdateUserUseCase, UpdateUserUseCaseWithValidation } from '../../useCases/user/UpdateUserUseCase'

import {
  IDomainEventDispatcher,
  IImageRepository,
  IImageFileService,
  IImageStorageService,
  ITransactionManager
} from '@hatsuportal/common-bounded-context'
import { IAuthorizationService } from '../auth/services/AuthorizationService'

export class UseCaseFactory implements IPostUseCaseFactory, IUserUseCaseFactory {
  constructor(
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly userRepository: IUserRepository,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userService: IUserService,
    private readonly userFactory: IUserFactory,
    private readonly storyRepository: IStoryRepository,
    private readonly storyApplicationMapper: IStoryApplicationMapper,
    private readonly storyFactory: IStoryFactory,
    private readonly imageRepository: IImageRepository,
    private readonly imageFileService: IImageFileService,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly imageFactory: IImageFactory,
    private readonly authorization: Authorization,
    private readonly authorizationService: IAuthorizationService
  ) {}

  // auth
  createLoginUserUseCase(): ILoginUserUseCase {
    return new LoginUserUseCase(this.userApplicationMapper, this.userRepository, this.authorization)
  }

  createRefreshTokenUseCase(): IRefreshTokenUseCase {
    return new RefreshTokenUseCase(this.userRepository, this.authorization)
  }

  // user
  createCreateUserUseCase(): ICreateUserUseCase {
    return new CreateUserUseCaseWithValidation(
      new CreateUserUseCase(this.userRepository, this.userApplicationMapper, this.eventDispatcher, this.userFactory),
      this.userRepository,
      this.authorizationService,
      this.userFactory
    )
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    return new UpdateUserUseCaseWithValidation(
      new UpdateUserUseCase(this.userRepository, this.userApplicationMapper, this.userService),
      this.userRepository
    )
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    return new DeadtivateUserUseCaseWithValidation(
      new DeactivateUserUseCase(this.userRepository, this.userApplicationMapper, this.eventDispatcher),
      this.userRepository,
      this.authorizationService
    )
  }

  createFindUserUseCase(): IFindUserUseCase {
    return new FindUserUseCase(this.userRepository, this.userApplicationMapper)
  }

  createGetAllUsersUseCase(): IGetAllUsersUseCase {
    return new GetAllUsersUseCase(this.userRepository, this.userApplicationMapper)
  }

  // story
  createCreateStoryUseCase(): ICreateStoryUseCase {
    return new CreateStoryUseCaseWithValidation(
      new CreateStoryUseCase(
        this.userRepository,
        this.imageRepository,
        this.storyRepository,
        this.storyApplicationMapper,
        this.storyFactory,
        this.transactionManager,
        this.eventDispatcher
      ),
      this.userRepository,
      this.authorizationService,
      this.storyFactory
    )
  }

  createUpdateStoryUseCase(): IUpdateStoryUseCase {
    return new UpdateStoryUseCaseWithValidation(
      new UpdateStoryUseCase(
        this.imageRepository,
        this.storyRepository,
        this.storyApplicationMapper,
        this.transactionManager,
        this.eventDispatcher
      ),
      this.userRepository,
      this.storyRepository,
      this.authorizationService
    )
  }

  createDeleteStoryUseCase(): IDeleteStoryUseCase {
    return new DeleteStoryUseCaseWithValidation(
      new DeleteStoryUseCase(
        this.imageRepository,
        this.storyRepository,
        this.storyApplicationMapper,
        this.transactionManager,
        this.eventDispatcher
      ),
      this.userRepository,
      this.storyRepository,
      this.authorizationService
    )
  }

  createSearchStoriesUseCase(): ISearchStoriesUseCase {
    return new SearchStoriesUseCaseWithValidation(
      new SearchStoriesUseCase(this.storyRepository, this.userRepository, this.storyApplicationMapper),
      this.userRepository
    )
  }

  createFindStoryUseCase(): IFindStoryUseCase {
    return new FindStoryUseCaseWithValidation(new FindStoryUseCase(this.storyRepository, this.storyApplicationMapper))
  }

  createFindMyStoriesUseCase(): IFindMyStoriesUseCase {
    return new FindMyStoriesUseCaseWithValidation(
      new FindMyStoriesUseCase(this.storyRepository, this.userRepository, this.storyApplicationMapper),
      this.userRepository
    )
  }

  // image
  createCreateImageUseCase(): ICreateImageUseCase {
    return new CreateImageUseCaseWithValidation(
      new CreateImageUseCase(
        this.userRepository,
        this.imageRepository,
        this.imageApplicationMapper,
        this.eventDispatcher,
        this.imageFactory
      ),
      this.userRepository,
      this.authorizationService,
      this.imageFactory
    )
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    return new UpdateImageUseCaseWithValidation(
      new UpdateImageUseCase(this.userRepository, this.imageRepository, this.imageApplicationMapper),
      this.userRepository,
      this.imageRepository
    )
  }

  createRemoveImageFromStoryUseCase(): IRemoveImageFromStoryUseCase {
    return new RemoveImageFromStoryUseCase(
      this.storyRepository,
      this.imageStorageService,
      this.imageRepository,
      this.storyApplicationMapper
    )
  }

  createFindImageUseCase(): IFindImageUseCase {
    return new FindImageUseCase(this.imageRepository, this.imageFileService, this.imageApplicationMapper)
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return new GetUserProfileUseCase(this.storyRepository)
  }
}
