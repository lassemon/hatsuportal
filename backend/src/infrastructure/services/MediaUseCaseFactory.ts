import {
  CreateImageUseCase,
  CreateImageUseCaseWithValidation,
  CreateStagedImageVersionUseCase,
  CreateStagedImageVersionUseCaseWithValidation,
  ICreateImageUseCase,
  ICreateStagedImageVersionUseCase,
  IUseCaseFactory as IMediaUseCaseFactory,
  PromoteImageVersionUseCase,
  PromoteImageVersionUseCaseWithValidation,
  IPromoteImageVersionUseCase,
  IDiscardImageVersionUseCase,
  DiscardImageVersionUseCase,
  DiscardImageVersionUseCaseWithValidation,
  IDeleteImageUseCase,
  DeleteImageUseCaseWithValidation,
  DeleteImageUseCase,
  IUpdateImageUseCase,
  UpdateImageUseCaseWithValidation,
  UpdateImageUseCase,
  IFindImageUseCase,
  FindImageUseCaseWithValidation,
  FindImageUseCase,
  IMediaAuthorizationService,
  IStorageKeyGenerator,
  IImageApplicationMapper,
  IImagePersistenceService,
  IUserGateway,
  IImageLookupService
} from '@hatsuportal/media-management'
import { ErrorHandlingUseCaseDecorator, IDomainEventService } from '@hatsuportal/platform'

export class MediaUseCaseFactory implements IMediaUseCaseFactory {
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly imageLookupService: IImageLookupService,
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly domainEventService: IDomainEventService,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly mediaStorageKeyGenerator: IStorageKeyGenerator,
    private readonly mediaAuthorizationService: IMediaAuthorizationService
  ) {}

  createCreateImageUseCase(): ICreateImageUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new CreateImageUseCaseWithValidation(
        new CreateImageUseCase(
          this.userGateway,
          this.imagePersistenceService,
          this.domainEventService,
          this.imageApplicationMapper,
          this.mediaStorageKeyGenerator
        ),
        this.userGateway,
        this.mediaAuthorizationService
      )
    )
  }

  createCreateStagedImageVersionUseCase(): ICreateStagedImageVersionUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new CreateStagedImageVersionUseCaseWithValidation(
        new CreateStagedImageVersionUseCase(this.imagePersistenceService, this.mediaStorageKeyGenerator),
        this.userGateway,
        this.mediaAuthorizationService
      )
    )
  }

  createPromoteImageVersionUseCase(): IPromoteImageVersionUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new PromoteImageVersionUseCaseWithValidation(
        new PromoteImageVersionUseCase(
          this.imageLookupService,
          this.imagePersistenceService,
          this.imageApplicationMapper,
          this.domainEventService,
          this.mediaStorageKeyGenerator
        ),
        this.userGateway,
        this.imageLookupService,
        this.imageApplicationMapper,
        this.mediaAuthorizationService
      )
    )
  }

  createDiscardImageVersionUseCase(): IDiscardImageVersionUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new DiscardImageVersionUseCaseWithValidation(
        new DiscardImageVersionUseCase(this.imageLookupService, this.imagePersistenceService),
        this.userGateway,
        this.imageLookupService,
        this.imageApplicationMapper,
        this.mediaAuthorizationService
      )
    )
  }

  createDeleteImageUseCase(): IDeleteImageUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new DeleteImageUseCaseWithValidation(
        new DeleteImageUseCase(this.imageLookupService, this.imagePersistenceService, this.domainEventService, this.imageApplicationMapper),
        this.userGateway,
        this.imageLookupService,
        this.imageApplicationMapper,
        this.mediaAuthorizationService
      )
    )
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new UpdateImageUseCaseWithValidation(
        new UpdateImageUseCase(
          this.userGateway,
          this.imageLookupService,
          this.imagePersistenceService,
          this.imageApplicationMapper,
          this.mediaStorageKeyGenerator,
          this.domainEventService
        ),
        this.userGateway,
        this.imageLookupService,
        this.imageApplicationMapper,
        this.mediaAuthorizationService
      )
    )
  }

  createFindImageUseCase(): IFindImageUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindImageUseCaseWithValidation(new FindImageUseCase(this.imageLookupService, this.imageApplicationMapper, this.userGateway))
    )
  }
}
