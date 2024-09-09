import {
  CreateImageRequestDTO,
  IImageMapper,
  InsertImageMetadataQueryDTO,
  UpdateImageMetadataQueryDTO,
  ICreateImageUseCase,
  ICreateImageUseCaseOptions
} from '@hatsuportal/application'
import { IImageService } from '@hatsuportal/application'

import { ApiError, ImageDTO, ImageMetadata, IImageMetadataRepository } from '@hatsuportal/domain'

export class CreateImageUseCase implements ICreateImageUseCase {
  constructor(
    private readonly imageService: IImageService,
    private readonly imageMetadataRepository: IImageMetadataRepository<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>,
    private readonly imageMapper: IImageMapper
  ) {}

  async execute({ createImageRequest, user }: ICreateImageUseCaseOptions): Promise<ImageDTO> {
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
