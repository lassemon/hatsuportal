import { CreateImageInputDTO } from '../../dtos/CreateImageInputDTO'
import { IStagedImageFactory } from '../../factories/StagedImageFactory'
import { IUseCase, IUseCaseOptions, IUnitOfWork } from '@hatsuportal/platform'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'
import { UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface ICreateStagedImageVersionUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createImageInput: CreateImageInputDTO
  imageCreated: (imageId: string, stagedVersionId: string) => void
}

export type ICreateStagedImageVersionUseCase = IUseCase<ICreateStagedImageVersionUseCaseOptions>

export class CreateStagedImageVersionUseCase implements ICreateStagedImageVersionUseCase {
  public constructor(
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly stagedImageFactory: IStagedImageFactory,
    private readonly unitOfWork: IUnitOfWork<UniqueId, UnixTimestamp>
  ) {}

  public async execute({ createdById, createImageInput, imageCreated }: ICreateStagedImageVersionUseCaseOptions): Promise<void> {
    const stagedImage = this.stagedImageFactory.createFromInput(createdById, createImageInput)
    const prepared = await this.imagePersistenceService.prepareStagedImageFile(stagedImage)
    const persistedStagedImage = this.stagedImageFactory.fromPreparedDTO(prepared)

    await this.unitOfWork.execute(async () => {
      this.imagePersistenceService.registerPreparedStagedImageFileRollbackCleanup(prepared)
      await this.imagePersistenceService.saveStagedImageMetadata(persistedStagedImage)
      return []
    })

    imageCreated(prepared.imageId, prepared.stagedVersionId)
  }
}
