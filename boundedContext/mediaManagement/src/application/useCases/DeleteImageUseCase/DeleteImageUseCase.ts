import { CurrentImage, Image, ImageId, IImageRepository } from '../../../domain'
import { DeleteImageInputDTO } from '../../dtos/DeleteImageInputDTO'
import { ImageDTO } from '../../dtos/ImageDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IUseCase, IUseCaseOptions, ITransactionManager, ITransactionAware, NotFoundError } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IDeleteImageUseCaseOptions extends IUseCaseOptions {
  deletedById: string
  deleteImageInput: DeleteImageInputDTO
  imageDeleted: (deletedImage: ImageDTO) => void
}

export type IDeleteImageUseCase = IUseCase<IDeleteImageUseCaseOptions>

export class DeleteImageUseCase implements IDeleteImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository & ITransactionAware,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>
  ) {}

  async execute({ deletedById, deleteImageInput, imageDeleted }: IDeleteImageUseCaseOptions): Promise<void> {
    let deletedImage: Image
    await this.transactionManager.execute<[Image]>(async () => {
      const image = await this.imageRepository.findById(new ImageId(deleteImageInput.imageId))
      if (!image) throw new NotFoundError('Image not found')

      deletedImage = image.clone()
      await this.imageRepository.delete(image)
      image.delete(deletedById)
      return [image]
    }, [this.imageRepository])

    imageDeleted(this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(deletedImage!)))
  }
}
