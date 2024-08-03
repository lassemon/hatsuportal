import {
  ICreateImageUseCase,
  ICreateStoryUseCase,
  ICreateUserUseCase,
  IDeactivateUserUseCase,
  IDeleteStoryUseCase,
  IFindImageUseCase,
  IFindStoryUseCase,
  IFindMyStoriesUseCase,
  IFindUserUseCase,
  IGetAllUsersUseCase,
  IGetUserProfileUseCase,
  IImageApplicationMapper,
  IImageMetadataApplicationMapper,
  IImageService,
  IImageStorageService,
  IStoryApplicationMapper,
  IRemoveImageFromStoryUseCase,
  ISearchStoriesUseCase,
  IUpdateImageUseCase,
  IUpdateStoryUseCase,
  IUpdateUserUseCase,
  IUseCaseFactory,
  IUserApplicationMapper,
  IUserService,
  ILoginUserUseCase,
  IRefreshTokenUseCase,
  IImageMetadataRepository,
  IUserRepository,
  IStoryRepository
} from '@hatsuportal/application'
import { CreateUserUseCase } from '../../useCases/user/CreateUserUseCase'
import { UpdateUserUseCase } from '../../useCases/user/UpdateUserUseCase'
import { DeactivateUserUseCase } from '../../useCases/user/DeadtivateUserUseCase'
import { FindUserUseCase } from '../../useCases/user/FindUserUseCase'
import { GetAllUsersUseCase } from '../../useCases/user/GetAllUsersUseCase'
import { UpdateImageUseCase } from '../../useCases/image/UpdateImageUseCase'
import { CreateImageUseCase } from '../../useCases/image/CreateImageUseCase'
import { RemoveImageFromStoryUseCase } from '../../useCases/image/RemoveImageFromStoryUseCase'
import { FindImageUseCase } from '../../useCases/image/FindImageUseCase'
import { CreateStoryUseCase } from '../../useCases/story/CreateStoryUseCase'
import { UpdateStoryUseCase } from '../../useCases/story/UpdateStoryUseCase'
import { DeleteStoryUseCase } from '../../useCases/story/DeleteStoryUseCase'
import { SearchStoriesUseCase } from '../../useCases/story/SearchStoriesUseCase'
import { FindStoryUseCase } from '../../useCases/story/FindStoryUseCase'
import { FindMyStoriesUseCase } from '../../useCases/story/FindMyStoriesUseCase'
import { GetUserProfileUseCase } from '../../useCases/profile/GetUserProfileUseCase'
import { FindStoryUseCaseWithValidation } from '../../useCases/story/FindStoryUseCaseWithValidation'
import { CreateUserUseCaseWithValidation } from '../../useCases/user/CreateUserUseCaseWithValidation'
import { SearchStoriesUseCaseWithValidation } from '../../useCases/story/SearchStoriesUseCaseWithValidation'
import { LoginUserUseCase } from '../../useCases/auth/LoginUserUseCase'
import { RefreshTokenUseCase } from '../../useCases/auth/RefreshTokenUseCase'

import { Authorization } from '/infrastructure'

export class UseCaseFactory implements IUseCaseFactory {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userService: IUserService,
    private readonly storyRepository: IStoryRepository,
    private readonly storyApplicationMapper: IStoryApplicationMapper,
    private readonly imageMetadataRepository: IImageMetadataRepository,
    private readonly imageService: IImageService,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly imageMetadataApplicationMapper: IImageMetadataApplicationMapper,
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
    return new CreateStoryUseCase(
      this.storyRepository,
      this.userRepository,
      this.createCreateImageUseCase(),
      this.createRemoveImageFromStoryUseCase(),
      this.storyApplicationMapper,
      this.imageApplicationMapper
    )
  }

  createUpdateStoryUseCase(): IUpdateStoryUseCase {
    return new UpdateStoryUseCase(
      this.storyRepository,
      this.userRepository,
      this.createCreateImageUseCase(),
      this.createRemoveImageFromStoryUseCase(),
      this.storyApplicationMapper
    )
  }

  createDeleteStoryUseCase(): IDeleteStoryUseCase {
    return new DeleteStoryUseCase(
      this.storyRepository,
      this.userRepository,
      this.createRemoveImageFromStoryUseCase(),
      this.storyApplicationMapper
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
    return new FindMyStoriesUseCase(this.storyRepository, this.userRepository, this.storyApplicationMapper)
  }

  // image
  createCreateImageUseCase(): ICreateImageUseCase {
    return new CreateImageUseCase(
      this.imageService,
      this.userRepository,
      this.imageMetadataRepository,
      this.imageApplicationMapper,
      this.imageMetadataApplicationMapper
    )
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    return new UpdateImageUseCase(
      this.userRepository,
      this.imageService,
      this.imageMetadataRepository,
      this.imageApplicationMapper,
      this.imageMetadataApplicationMapper
    )
  }

  createRemoveImageFromStoryUseCase(): IRemoveImageFromStoryUseCase {
    return new RemoveImageFromStoryUseCase(
      this.storyRepository,
      this.imageStorageService,
      this.imageMetadataRepository,
      this.storyApplicationMapper
    )
  }

  createFindImageUseCase(): IFindImageUseCase {
    return new FindImageUseCase(
      this.imageMetadataRepository,
      this.imageService,
      this.imageApplicationMapper,
      this.imageMetadataApplicationMapper
    )
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return new GetUserProfileUseCase(this.storyRepository)
  }
}
