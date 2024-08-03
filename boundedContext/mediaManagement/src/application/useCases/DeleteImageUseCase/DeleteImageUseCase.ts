import { CurrentImage, Image, ImageId } from '../../../domain'
import { DeleteImageInputDTO } from '../../dtos/DeleteImageInputDTO'
import { ImageDTO } from '../../dtos/ImageDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'
import { IImageLookupService } from '../../services/image/ImageLookupService'
import { IDomainEventService } from '@hatsuportal/platform/src/application/services/IDomainEventService'
import { UniqueId } from '@hatsuportal/shared-kernel'

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
    private readonly domainEventService: IDomainEventService,
    private readonly imageMapper: IImageApplicationMapper
  ) {}

  async execute({ deletedById, deleteImageInput, imageDeleted }: IDeleteImageUseCaseOptions): Promise<void> {
    let deletedImage: Image
    const image = await this.imageLookupService.findById(new ImageId(deleteImageInput.imageId))
    if (!image) throw new NotFoundError('Image not found')

    deletedImage = image.clone()
    await this.imagePersistenceService.delete(image)
    image.delete(new UniqueId(deletedById))

    await this.domainEventService.persistToOutbox(image.domainEvents)

    imageDeleted(this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(deletedImage!)))
  }
}
