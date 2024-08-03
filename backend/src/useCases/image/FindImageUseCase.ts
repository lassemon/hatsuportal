import {
  IImageService,
  IFindImageUseCase,
  IFindImageUseCaseOptions,
  IImageMetadataApplicationMapper,
  IImageApplicationMapper,
  NotFoundError,
  ApplicationError,
  IImageMetadataRepository
} from '@hatsuportal/application'
import { Image, PostId } from '@hatsuportal/domain'

export class FindImageUseCase implements IFindImageUseCase {
  constructor(
    private readonly imageMetadataRepository: IImageMetadataRepository,
    private readonly imageService: IImageService,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly imageMetadataMepper: IImageMetadataApplicationMapper
  ) {}

  async execute({ imageId, imageFound }: IFindImageUseCaseOptions): Promise<void> {
    try {
      const imageMetadata = await this.imageMetadataRepository.findById(new PostId(imageId))
      if (!imageMetadata || !imageMetadata.fileName) {
        throw new NotFoundError(`Image metadata for ${imageId} was NotFound from the database.`)
      }

      const imageBase64 = await this.imageService.getImageFromFileSystem(imageMetadata.storageFileName)

      imageFound(this.imageMapper.toDTO(new Image({ ...this.imageMetadataMepper.toDTO(imageMetadata), base64: imageBase64 })))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
