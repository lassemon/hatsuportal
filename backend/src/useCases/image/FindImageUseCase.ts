import { ApplicationError, NotFoundError } from '@hatsuportal/common-bounded-context'
import {
  IImageFileService,
  IFindImageUseCase,
  IFindImageUseCaseOptions,
  IImageApplicationMapper,
  IImageRepository,
  Image,
  ImageId
} from '@hatsuportal/common-bounded-context'

export class FindImageUseCase implements IFindImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageFileService: IImageFileService,
    private readonly imageMapper: IImageApplicationMapper
  ) {}

  async execute({ imageId, imageFound }: IFindImageUseCaseOptions): Promise<void> {
    try {
      const image = await this.imageRepository.findById(new ImageId(imageId))
      if (!image || !image.fileName) {
        throw new NotFoundError(`Image metadata for ${imageId} was NotFound from the database.`)
      }

      const imageBase64 = await this.imageFileService.getImageFromFileSystem(image.storageFileName)

      imageFound(this.imageMapper.toDTO(new Image({ ...this.imageMapper.toDTO(image), base64: imageBase64 })))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
