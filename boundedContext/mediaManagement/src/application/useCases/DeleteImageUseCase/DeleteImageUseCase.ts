import { CurrentImage, ImageId } from '../../../domain'
import { DeleteImageInputDTO } from '../../dtos/DeleteImageInputDTO'
import { ImageDTO } from '../../dtos/ImageDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IUseCase, IUseCaseOptions, IUnitOfWork, NotFoundError } from '@hatsuportal/platform'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'
import { IImageLookupService } from '../../services/image/ImageLookupService'
import { UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IDeleteImageUseCaseOptions extends IUseCaseOptions {
  deletedById: string
  deleteImageInput: DeleteImageInputDTO
  imageDeleted: (deletedImage: ImageDTO) => void
}

export type IDeleteImageUseCase = IUseCase<IDeleteImageUseCaseOptions>

export class DeleteImageUseCase implements IDeleteImageUseCase {
  constructor(
    private readonly imageLookupService: IImageLookupService,
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly unitOfWork: IUnitOfWork<UniqueId, UnixTimestamp>
  ) {}

  async execute({ deletedById, deleteImageInput, imageDeleted }: IDeleteImageUseCaseOptions): Promise<void> {
    const image = await this.imageLookupService.findById(new ImageId(deleteImageInput.imageId))
    if (!image) throw new NotFoundError('Image not found')

    const deletedImage = image.clone()
    const deletedImageDto = this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(image))
    deletedImage.delete(new UniqueId(deletedById))

    let storageKeys: string[] = []
    await this.unitOfWork.execute(async () => {
      storageKeys = await this.imagePersistenceService.deleteImageMetadata(image)
      return [deletedImage]
    })

    await this.imagePersistenceService.deleteImageFiles(storageKeys)

    imageDeleted(deletedImageDto)
  }
}
