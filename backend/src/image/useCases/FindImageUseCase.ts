import {
  ImageServiceInterface,
  InsertImageMetadataQueryDTO,
  UpdateImageMetadataQueryDTO,
  UseCaseInterface,
  UseCaseOptionsInterface
} from '@hatsuportal/application'
import { ApiError, Image, ImageDTO, ImageMetadataRepositoryInterface } from '@hatsuportal/domain'

export interface FindImageUseCaseOptions extends UseCaseOptionsInterface {
  imageId: string
}

export type FindImageUseCaseInterface = UseCaseInterface<FindImageUseCaseOptions, ImageDTO>

export class FindImageUseCase implements FindImageUseCaseInterface {
  constructor(
    private readonly imageMetadataRepository: ImageMetadataRepositoryInterface<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>,
    private readonly imageService: ImageServiceInterface
  ) {}

  async execute({ imageId }: FindImageUseCaseOptions): Promise<ImageDTO> {
    const imageMetadata = await this.imageMetadataRepository.findById(imageId)
    if (!imageMetadata || !imageMetadata.fileName) {
      throw new ApiError(404, 'NotFound', `Image metadata for ${imageId} was NotFound from the database.`)
    }
    const fileName = imageMetadata.fileName

    const imageBase64 = await this.imageService.getImageFromFileSystem(fileName)

    return new Image({ ...imageMetadata.serialize(), base64: imageBase64 }).serialize()
  }
}
