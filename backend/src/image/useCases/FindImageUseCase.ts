import {
  IImageService,
  InsertImageMetadataQueryDTO,
  UpdateImageMetadataQueryDTO,
  IFindImageUseCase,
  IFindImageUseCaseOptions
} from '@hatsuportal/application'
import { ApiError, Image, ImageDTO, IImageMetadataRepository } from '@hatsuportal/domain'

export class FindImageUseCase implements IFindImageUseCase {
  constructor(
    private readonly imageMetadataRepository: IImageMetadataRepository<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>,
    private readonly imageService: IImageService
  ) {}

  async execute({ imageId }: IFindImageUseCaseOptions): Promise<ImageDTO> {
    const imageMetadata = await this.imageMetadataRepository.findById(imageId)
    if (!imageMetadata || !imageMetadata.fileName) {
      throw new ApiError(404, 'NotFound', `Image metadata for ${imageId} was NotFound from the database.`)
    }
    const fileName = imageMetadata.fileName

    const imageBase64 = await this.imageService.getImageFromFileSystem(fileName)

    return new Image({ ...imageMetadata.serialize(), base64: imageBase64 }).serialize()
  }
}
