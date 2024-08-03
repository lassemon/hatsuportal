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
import { ICreateImageUseCase, IFindImageUseCase, IImageApplicationMapper, IUpdateImageUseCase } from '@hatsuportal/common-bounded-context'
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
import { CreateUserUseCase } from '../../useCases/user/CreateUserUseCase'
import { UpdateUserUseCase } from '../../useCases/user/UpdateUserUseCase'
import { DeactivateUserUseCase } from '../../useCases/user/DeadtivateUserUseCase'
import { FindUserUseCase } from '../../useCases/user/FindUserUseCase'
import { GetAllUsersUseCase } from '../../useCases/user/GetAllUsersUseCase'
import { UpdateImageUseCase } from '../../useCases/image/UpdateImageUseCase'
import { CreateImageUseCase } from '../../useCases/image/CreateImageUseCase'
import { RemoveImageFromStoryUseCase } from '../../useCases/image/RemoveImageFromStoryUseCase'
import { FindImageUseCase } from '../../useCases/image/FindImageUseCase'
import { CreateStoryUseCase } from '../../useCases/story/CreateStoryUseCase/CreateStoryUseCase'
import { UpdateStoryUseCase } from '../../useCases/story/UpdateStoryUseCase/UpdateStoryUseCase'
import { DeleteStoryUseCase } from '../../useCases/story/DeleteStoryUseCase/DeleteStoryUseCase'
import { SearchStoriesUseCase } from '../../useCases/story/SearchStoriesUseCase/SearchStoriesUseCase'
import { FindStoryUseCase } from '../../useCases/story/FindStoryUseCase/FindStoryUseCase'
import { FindMyStoriesUseCase } from '../../useCases/story/FindMyStoriesUseCase/FindMyStoriesUseCase'
import { GetUserProfileUseCase } from '../../useCases/profile/GetUserProfileUseCase'
import { FindStoryUseCaseWithValidation } from '../../useCases/story/FindStoryUseCase/FindStoryUseCaseWithValidation'
import { CreateUserUseCaseWithValidation } from '../../useCases/user/CreateUserUseCaseWithValidation'
import { SearchStoriesUseCaseWithValidation } from '../../useCases/story/SearchStoriesUseCase/SearchStoriesUseCaseWithValidation'
import { LoginUserUseCase } from '../../useCases/auth/LoginUserUseCase'
import { RefreshTokenUseCase } from '../../useCases/auth/RefreshTokenUseCase'

import { Authorization } from '/infrastructure'

import { UpdateStoryUseCaseWithValidation } from '../../useCases/story/UpdateStoryUseCase/UpdateStoryUseCaseWithValidation'
import { FindMyStoriesUseCaseWithValidation } from '../../useCases/story/FindMyStoriesUseCase/FindMyStoriesUseCaseWithValidation'
import { CreateStoryUseCaseWithValidation } from '../../useCases/story/CreateStoryUseCase/CreateStoryUseCaseWithValidation'
import { DeleteStoryUseCaseWithValidation } from '../../useCases/story/DeleteStoryUseCase/DeleteStoryUseCaseWithValidation'
import {
  IDomainEventDispatcher,
  IImageRepository,
  IImageFileService,
  IImageStorageService,
  ITransactionManager
} from '@hatsuportal/common-bounded-context'

export class UseCaseFactory implements IPostUseCaseFactory, IUserUseCaseFactory {
  constructor(
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly userRepository: IUserRepository,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userService: IUserService,
    private readonly storyRepository: IStoryRepository,
    private readonly storyApplicationMapper: IStoryApplicationMapper,
    private readonly imageRepository: IImageRepository,
    private readonly imageFileService: IImageFileService,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly authorization: Authorization
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
    return new CreateUserUseCaseWithValidation(new CreateUserUseCase(this.userRepository, this.userApplicationMapper))
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    return new UpdateUserUseCase(this.userRepository, this.userApplicationMapper, this.userService)
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    return new DeactivateUserUseCase(this.userRepository)
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
        this.transactionManager,
        this.eventDispatcher
      ),
      this.userRepository
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
      this.storyRepository
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
      this.storyRepository
    )
  }

  createSearchStoriesUseCase(): ISearchStoriesUseCase {
    return new SearchStoriesUseCaseWithValidation(
      new SearchStoriesUseCase(this.storyRepository, this.userRepository, this.storyApplicationMapper)
    )
  }

  createFindStoryUseCase(): IFindStoryUseCase {
    return new FindStoryUseCaseWithValidation(new FindStoryUseCase(this.storyRepository, this.storyApplicationMapper))
  }

  createFindMyStoriesUseCase(): IFindMyStoriesUseCase {
    return new FindMyStoriesUseCaseWithValidation(
      new FindMyStoriesUseCase(this.storyRepository, this.userRepository, this.storyApplicationMapper)
    )
  }

  // image
  createCreateImageUseCase(): ICreateImageUseCase {
    return new CreateImageUseCase(this.userRepository, this.imageRepository, this.imageApplicationMapper)
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    return new UpdateImageUseCase(this.userRepository, this.imageRepository, this.imageApplicationMapper)
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
