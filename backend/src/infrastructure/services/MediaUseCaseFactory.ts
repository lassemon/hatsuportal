import {
  CreateStagedImageVersionUseCase,
  CreateStagedImageVersionUseCaseWithValidation,
  ICreateStagedImageVersionUseCase,
  IUseCaseFactory as IMediaUseCaseFactory,
  PromoteImageVersionUseCase,
  PromoteImageVersionUseCaseWithValidation,
  IPromoteImageVersionUseCase,
  IDeleteImageUseCase,
  DeleteImageUseCaseWithValidation,
  DeleteImageUseCase,
  IFindImageUseCase,
  FindImageUseCaseWithValidation,
  FindImageUseCase,
  IMediaAuthorizationService,
  IStorageKeyGenerator,
  IImageApplicationMapper,
  IImagePersistenceService,
  IUserGateway,
  IImageLookupService,
  IImageRepository,
  StagedImageFactory
} from '@hatsuportal/media-management'
import { ErrorHandlingUseCaseDecorator, IUnitOfWork } from '@hatsuportal/platform'
import { UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'

export class MediaUseCaseFactory implements IMediaUseCaseFactory {
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly imageRepository: IImageRepository,
    private readonly imageLookupService: IImageLookupService,
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly mediaStorageKeyGenerator: IStorageKeyGenerator,
    private readonly mediaAuthorizationService: IMediaAuthorizationService,
    private readonly unitOfWork: IUnitOfWork<UniqueId, UnixTimestamp>
  ) {}

  createCreateStagedImageVersionUseCase(): ICreateStagedImageVersionUseCase {
    const stagedImageFactory = new StagedImageFactory(this.mediaStorageKeyGenerator)
    return new ErrorHandlingUseCaseDecorator(
      new CreateStagedImageVersionUseCaseWithValidation(
        new CreateStagedImageVersionUseCase(this.imagePersistenceService, stagedImageFactory, this.unitOfWork),
        this.userGateway,
        this.mediaAuthorizationService
      )
    )
  }

  createPromoteImageVersionUseCase(): IPromoteImageVersionUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new PromoteImageVersionUseCaseWithValidation(
        new PromoteImageVersionUseCase(this.imageRepository, this.imagePersistenceService, this.imageApplicationMapper),
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
        new DeleteImageUseCase(this.imageLookupService, this.imagePersistenceService, this.imageApplicationMapper, this.unitOfWork),
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
