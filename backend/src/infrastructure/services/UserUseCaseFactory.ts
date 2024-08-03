import { ErrorHandlingUseCaseDecorator, IDomainEventService, ITransactionAware } from '@hatsuportal/platform'
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
  IUserRepository,
  GetUserProfileUseCase,
  IGetUserProfileUseCase,
  IPostGateway,
  IUserAuthenticationService
} from '@hatsuportal/user-management'

export class UserUseCaseFactory implements IUserUseCaseFactory {
  constructor(
    private readonly userRepository: IUserRepository & ITransactionAware,
    private readonly postGateway: IPostGateway,
    private readonly userAuthenticationService: IUserAuthenticationService,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userAuthorizationService: IUserAuthorizationService,
    private readonly passwordFactory: IPasswordFactory,
    private readonly domainEventService: IDomainEventService,
    private readonly tokenService: ITokenService
  ) {}

  // auth
  createLoginUserUseCase(): ILoginUserUseCase {
    return new LoginUserUseCaseWithValidation(
      new LoginUserUseCase(this.userApplicationMapper, this.userRepository, this.tokenService),
      this.passwordFactory
    )
  }

  createRefreshTokenUseCase(): IRefreshTokenUseCase {
    return new RefreshTokenUseCaseWithValidation(new RefreshTokenUseCase(this.userRepository, this.tokenService))
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return new ErrorHandlingUseCaseDecorator(new GetUserProfileUseCase(this.postGateway))
  }

  // user
  createCreateUserUseCase(): ICreateUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new CreateUserUseCaseWithValidation(
        new CreateUserUseCase(this.userRepository, this.userApplicationMapper, this.domainEventService, this.passwordFactory),
        this.userRepository,
        this.userApplicationMapper,
        this.userAuthorizationService,
        this.passwordFactory
      )
    )
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new UpdateUserUseCaseWithValidation(
        new UpdateUserUseCase(
          this.userRepository,
          this.userApplicationMapper,
          this.userAuthenticationService,
          this.passwordFactory,
          this.domainEventService
        ),
        this.userRepository,
        this.userApplicationMapper,
        this.userAuthorizationService,
        this.passwordFactory
      )
    )
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new DeactivateUserUseCaseWithValidation(
        new DeactivateUserUseCase(this.userRepository, this.userApplicationMapper, this.domainEventService),
        this.userRepository,
        this.userApplicationMapper,
        this.userAuthorizationService
      )
    )
  }

  createFindUserUseCase(): IFindUserUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindUserUseCaseWithValidation(
        new FindUserUseCase(this.userRepository, this.userApplicationMapper),
        this.userRepository,
        this.userApplicationMapper,
        this.userAuthorizationService
      )
    )
  }

  createGetAllUsersUseCase(): IGetAllUsersUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new GetAllUsersUseCaseWithValidation(
        new GetAllUsersUseCase(this.userRepository, this.userApplicationMapper),
        this.userRepository,
        this.userApplicationMapper,
        this.userAuthorizationService
      )
    )
  }
}
