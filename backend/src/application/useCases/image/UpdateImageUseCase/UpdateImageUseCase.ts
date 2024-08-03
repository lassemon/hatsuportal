import { ConcurrencyError, ITransactionManager } from '@hatsuportal/common-bounded-context'
import {
  IImageApplicationMapper,
  IUpdateImageUseCase,
  IUpdateImageUseCaseOptions,
  IImageRepository,
  ImageId
} from '@hatsuportal/common-bounded-context'

export class UpdateImageUseCase implements IUpdateImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({ updateImageInput, imageUpdated, updateConflict }: IUpdateImageUseCaseOptions): Promise<void> {
    try {
      const savedImage = await this.transactionManager.execute(async () => {
        const { updateImageData } = updateImageInput

        const existingImage = await this.imageRepository.findById(new ImageId(updateImageData.id))

        const updatedImage = await this.imageRepository.update(existingImage!)

        return updatedImage
      }, [this.imageRepository])
      imageUpdated(this.imageMapper.toDTO(savedImage))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
