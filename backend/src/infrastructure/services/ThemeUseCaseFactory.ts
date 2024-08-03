import { ErrorHandlingUseCaseDecorator, IUnitOfWork } from '@hatsuportal/platform'
import {
  CreateThemeUseCase,
  CreateThemeUseCaseWithValidation,
  DeleteThemeUseCase,
  DeleteThemeUseCaseWithValidation,
  ICreateThemeUseCase,
  IDeleteThemeUseCase,
  IListThemesUseCase,
  IThemeApplicationMapper,
  IThemeAuthorizationService,
  IThemeUseCaseFactory,
  IUpdateThemeUseCase,
  IUserReadRepository,
  ListThemesUseCase,
  ListThemesUseCaseWithValidation,
  UpdateThemeUseCase,
  UpdateThemeUseCaseWithValidation
} from '@hatsuportal/user-management'
import { IThemeRepository } from '@hatsuportal/user-management'

export class ThemeUseCaseFactory implements IThemeUseCaseFactory {
  constructor(
    private readonly themeRepository: IThemeRepository,
    private readonly userReadRepository: IUserReadRepository,
    private readonly themeApplicationMapper: IThemeApplicationMapper,
    private readonly themeAuthorizationService: IThemeAuthorizationService,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  createListThemesUseCase(): IListThemesUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new ListThemesUseCaseWithValidation(
        new ListThemesUseCase(this.themeRepository, this.themeApplicationMapper),
        this.userReadRepository,
        this.themeAuthorizationService
      )
    )
  }

  createCreateThemeUseCase(): ICreateThemeUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new CreateThemeUseCaseWithValidation(
        new CreateThemeUseCase(this.themeRepository, this.themeApplicationMapper, this.unitOfWork),
        this.userReadRepository,
        this.themeAuthorizationService
      )
    )
  }

  createUpdateThemeUseCase(): IUpdateThemeUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new UpdateThemeUseCaseWithValidation(
        new UpdateThemeUseCase(this.themeRepository, this.themeApplicationMapper, this.unitOfWork),
        this.userReadRepository,
        this.themeRepository,
        this.themeApplicationMapper,
        this.themeAuthorizationService
      )
    )
  }

  createDeleteThemeUseCase(): IDeleteThemeUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new DeleteThemeUseCaseWithValidation(
        new DeleteThemeUseCase(this.themeRepository, this.userReadRepository, this.unitOfWork),
        this.userReadRepository,
        this.themeRepository,
        this.themeApplicationMapper,
        this.themeAuthorizationService
      )
    )
  }
}
