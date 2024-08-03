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
  IRefreshTokenUseCase
} from '@hatsuportal/application'
import { IImageMetadataRepository, IStoryRepository, IUserRepository } from '@hatsuportal/domain'
import { CreateUserUseCase } from '/user/useCases/CreateUserUseCase'
import { UpdateUserUseCase } from '/user/useCases/UpdateUserUseCase'
import { DeactivateUserUseCase } from '/user/useCases/DeadtivateUserUseCase'
import { FindUserUseCase } from '/user/useCases/FindUserUseCase'
import { GetAllUsersUseCase } from '/user/useCases/GetAllUsersUseCase'
import { CreateImageUseCase } from '/image/useCases/CreateImageUseCase'
import { UpdateImageUseCase } from '/image/useCases/UpdateImageUseCase'
import { RemoveImageFromStoryUseCase } from '/image/useCases/RemoveImageFromStoryUseCase'
import { FindImageUseCase } from '/image/useCases/FindImageUseCase'
import { CreateStoryUseCase } from '/story/useCases/CreateStoryUseCase'
import { UpdateStoryUseCase } from '/story/useCases/UpdateStoryUseCase'
import { DeleteStoryUseCase } from '/story/useCases/DeleteStoryUseCase'
import { SearchStoriesUseCase } from '/story/useCases/SearchStoriesUseCase'
import { FindStoryUseCase } from '/story/useCases/FindStoryUseCase'
import { FindMyStoriesUseCase } from '/story/useCases/FindMyStoriesUseCase'
import { GetUserProfileUseCase } from '/profile/useCases/GetUserProfileUseCase'
import { FindStoryUseCaseWithValidation } from '/story/useCases/FindStoryUseCaseWithValidation'
import { CreateUserUseCaseWithValidation } from '/user/useCases/CreateUserUseCaseWithValidation'
import { SearchStoriesUseCaseWithValidation } from '/story/useCases/SearchStoriesUseCaseWithValidation'
import { LoginUserUseCase } from '/auth/useCases/LoginUserUseCase'
import Authorization from '/auth/Authorization'
import { RefreshTokenUseCase } from '/auth/useCases/RefreshTokenUseCase'

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
