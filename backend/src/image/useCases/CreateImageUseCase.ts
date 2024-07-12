import {
  CreateImageRequestDTO,
  ImageMapperInterface,
  InsertImageMetadataQueryDTO,
  UpdateImageMetadataQueryDTO,
  UseCaseInterface,
  UseCaseOptionsInterface
} from '@hatsuportal/application'
import { ImageServiceInterface } from '@hatsuportal/application'

import { ApiError, ImageDTO, ImageMetadata, ImageMetadataRepositoryInterface, User } from '@hatsuportal/domain'

export interface CreateImageUseCaseOptions extends UseCaseOptionsInterface {
  user: User
  createImageRequest: CreateImageRequestDTO
}

export type CreateImageUseCaseInterface = UseCaseInterface<CreateImageUseCaseOptions, ImageDTO>

export class CreateImageUseCase implements CreateImageUseCaseInterface {
  constructor(
    private readonly imageService: ImageServiceInterface,
    private readonly imageMetadataRepository: ImageMetadataRepositoryInterface<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>,
    private readonly imageMapper: ImageMapperInterface
  ) {}

  async execute({ createImageRequest, user }: CreateImageUseCaseOptions): Promise<ImageDTO> {
    const imageMetadata = this.imageMapper.createRequestToImageMetadata(createImageRequest, user)

    await this.ensureUniqueImageId(imageMetadata.id)

    const resizedBuffer = await this.getResizedImageBuffer(createImageRequest)
    imageMetadata.mimeType = await this.imageService.validateMimeType(resizedBuffer, imageMetadata)
    imageMetadata.fileName = this.imageService.parseImageFilename(imageMetadata)

    this.imageService.writeImageToFileSystem(resizedBuffer, imageMetadata)

    const newImageMetadata = await this.insertImageMetadata(imageMetadata)

    const image = this.imageMapper.metadataToImage(
      newImageMetadata.serialize(),
      this.imageService.convertBufferToBase64Image(resizedBuffer, imageMetadata)
    )
    return image.serialize()
  }

  private async ensureUniqueImageId(id: string): Promise<void> {
    const previousImage = await this.imageMetadataRepository.findById(id)
    if (previousImage) {
      throw new ApiError(403, 'AlreadyExists', `Cannot create image with id ${id} because it already exists.`)
    }
  }

  private async getResizedImageBuffer(createImageRequest: CreateImageRequestDTO) {
    const imageBuffer = this.imageService.convertBase64ImageToBuffer(createImageRequest.base64)
    return await this.imageService.resizeImageBuffer(imageBuffer)
  }

  private async insertImageMetadata(imageMetadata: ImageMetadata): Promise<ImageMetadata> {
    const insertQuery = this.imageMapper.toInsertQuery(imageMetadata.serialize())
    return this.imageMetadataRepository.insert(insertQuery)
  }
}
