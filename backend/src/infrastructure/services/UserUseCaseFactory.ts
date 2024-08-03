import { ErrorHandlingUseCaseDecorator, IUnitOfWork } from '@hatsuportal/platform'
import {
  ICreateUserUseCase,
  ILoginUserUseCase,
  IUseCaseFactory as IUserUseCaseFactory,
  LoginUserUseCase,
  LoginUserUseCaseWithValidation,
  RefreshTokenUseCase,
  RefreshTokenUseCaseWithValidation,
  CreateUserUseCaseWithValidation,
  CreateUserUseCase,
  IRefreshTokenUseCase,
  IUpdateUserUseCase,
  UpdateUserUseCaseWithValidation,
  UpdateUserUseCase,
  IDeactivateUserUseCase,
  DeactivateUserUseCaseWithValidation,
  DeactivateUserUseCase,
  IFindUserUseCase,
  FindUserUseCaseWithValidation,
  FindUserUseCase,
  IGetAllUsersUseCase,
  GetAllUsersUseCaseWithValidation,
  GetAllUsersUseCase,
  IUserApplicationMapper,
  ITokenService,
  IPasswordFactory,
  IUserAuthorizationService,
  IUserWriteRepository,
  IUserReadRepository,
  IUserLookupService,
  GetUserProfileUseCase,
  GetUserProfileUseCaseWithValidation,
  IGetUserProfileUseCase,
  GetUserPreferencesUseCase,
  GetUserPreferencesUseCaseWithValidation,
  IGetUserPreferencesUseCase,
  UpdateUserProfileUseCase,
  UpdateUserProfileUseCaseWithValidation,
  IUpdateUserProfileUseCase,
  UpdateUserPreferencesUseCase,
  UpdateUserPreferencesUseCaseWithValidation,
  IUpdateUserPreferencesUseCase,
  IUserAuthenticationService,
  IMediaGateway,
  IProfileImageCleanupService,
  IThemeRepository
} from '@hatsuportal/user-management'

export class UserUseCaseFactory implements IUserUseCaseFactory {
  constructor(
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly userReadRepository: IUserReadRepository,
    private readonly userLookupService: IUserLookupService,
    private readonly userAuthenticationService: IUserAuthenticationService,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userAuthorizationService: IUserAuthorizationService,
    private readonly themeRepository: IThemeRepository,
    private readonly passwordFactory: IPasswordFactory,
    private readonly unitOfWork: IUnitOfWork,
    private readonly tokenService: ITokenService,
    private readonly mediaGatewayForUserManagement: IMediaGateway,
    private readonly profileImageCleanupService: IProfileImageCleanupService
  ) {}

  // auth
  createLoginUserUseCase(): ILoginUserUseCase {
    return new LoginUserUseCaseWithValidation(
      new LoginUserUseCase(this.userApplicationMapper, this.userWriteRepository, this.tokenService),
      this.passwordFactory
    )
  }

  createRefreshTokenUseCase(): IRefreshTokenUseCase {
    return new RefreshTokenUseCaseWithValidation(
      new RefreshTokenUseCase(this.userReadRepository, this.userApplicationMapper, this.tokenService)
    )
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new GetUserProfileUseCaseWithValidation(
        new GetUserProfileUseCase(this.userReadRepository, this.userApplicationMapper),
        this.userReadRepository,
        this.userAuthorizationService
      )
    )
  }

  createGetUserPreferencesUseCase(): IGetUserPreferencesUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new GetUserPreferencesUseCaseWithValidation(
        new GetUserPreferencesUseCase(this.userReadRepository, this.userApplicationMapper),
        this.userReadRepository,
        this.userAuthorizationService
      )
    )
  }

  createUpdateUserProfileUseCase(): IUpdateUserProfileUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new UpdateUserProfileUseCaseWithValidation(
        new UpdateUserProfileUseCase(
          this.mediaGatewayForUserManagement,
          this.userWriteRepository,
          this.userLookupService,
          this.userApplicationMapper,
          this.profileImageCleanupService,
          this.unitOfWork
        ),
        this.userReadRepository,
        this.userAuthorizationService
      )
    )
  }

  createUpdateUserPreferencesUseCase(): IUpdateUserPreferencesUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new UpdateUserPreferencesUseCaseWithValidation(
        new UpdateUserPreferencesUseCase(this.userWriteRepository, this.userLookupService, this.userApplicationMapper, this.unitOfWork),
        this.userReadRepository,
        this.themeRepository,
        this.userAuthorizationService
      )
    )
  }

  // user
  createCreateUserUseCase(): ICreateUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new CreateUserUseCaseWithValidation(
        new CreateUserUseCase(
          this.userWriteRepository,
          this.userLookupService,
          this.userApplicationMapper,
          this.unitOfWork,
          this.passwordFactory
        ),
        this.userReadRepository,
        this.userAuthorizationService,
        this.passwordFactory
      )
    )
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new UpdateUserUseCaseWithValidation(
        new UpdateUserUseCase(
          this.userWriteRepository,
          this.userLookupService,
          this.userApplicationMapper,
          this.userAuthenticationService,
          this.passwordFactory,
          this.unitOfWork
        ),
        this.userReadRepository,
        this.userAuthorizationService,
        this.passwordFactory
      )
    )
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new DeactivateUserUseCaseWithValidation(
        new DeactivateUserUseCase(this.userWriteRepository, this.userLookupService, this.userApplicationMapper, this.unitOfWork),
        this.userReadRepository,
        this.userAuthorizationService
      )
    )
  }

  createFindUserUseCase(): IFindUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindUserUseCaseWithValidation(
        new FindUserUseCase(this.userReadRepository, this.userApplicationMapper),
        this.userReadRepository,
        this.userAuthorizationService
      )
    )
  }

  createGetAllUsersUseCase(): IGetAllUsersUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new GetAllUsersUseCaseWithValidation(
        new GetAllUsersUseCase(this.userReadRepository, this.userApplicationMapper),
        this.userReadRepository,
        this.userAuthorizationService
      )
    )
  }
}
