import {
  IImageService,
  IFindImageUseCase,
  IFindImageUseCaseOptions,
  IImageApplicationMapper,
  NotFoundError,
  ApplicationError
} from '@hatsuportal/application'
import { IImageRepository, Image, PostId } from '@hatsuportal/domain'

export class FindImageUseCase implements IFindImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageService: IImageService,
    private readonly imageMapper: IImageApplicationMapper
  ) {}

  async execute({ imageId, imageFound }: IFindImageUseCaseOptions): Promise<void> {
    try {
      const image = await this.imageRepository.findById(new PostId(imageId))
      if (!image || !image.fileName) {
        throw new NotFoundError(`Image metadata for ${imageId} was NotFound from the database.`)
      }

      const imageBase64 = await this.imageService.getImageFromFileSystem(image.storageFileName)

      imageFound(this.imageMapper.toDTO(new Image({ ...this.imageMapper.toDTO(image), base64: imageBase64 })))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
