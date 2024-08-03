import { Image, ImageId } from '../../../domain'
import { DeleteImageInputDTO } from '../../dtos/DeleteImageInputDTO'
import { ImageDTO } from '../../dtos/ImageDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IImageRepository } from '../../repositories/IImageRepository'
import { ITransactionManager, IUseCase, IUseCaseOptions } from '@hatsuportal/foundation'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { CurrentImage } from '../../models/CurrentImage'

export interface IDeleteImageUseCaseOptions extends IUseCaseOptions {
  deletedById: string
  deleteImageInput: DeleteImageInputDTO
  imageDeleted: (deletedImage: ImageDTO) => void
}

export type IDeleteImageUseCase = IUseCase<IDeleteImageUseCaseOptions>

export class DeleteImageUseCase implements IDeleteImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>
  ) {}

  async execute({ deleteImageInput, imageDeleted }: IDeleteImageUseCaseOptions): Promise<void> {
    const [deletedImage] = await this.transactionManager.execute<[Image]>(async () => {
      const image = await this.imageRepository.findById(new ImageId(deleteImageInput.imageId))
      if (!image) {
        throw new Error('Image not found')
      }
      return [await this.imageRepository.delete(image)]
    }, [this.imageRepository])

    imageDeleted(this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(deletedImage)))
  }
}
