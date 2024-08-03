import {
  ApplicationError,
  AuthenticationError,
  ForbiddenError,
  ICreateImageUseCase,
  ICreateImageUseCaseOptions,
  IImageApplicationMapper,
  IImageMetadataApplicationMapper,
  IImageMetadataRepository,
  IUserRepository
} from '@hatsuportal/application'
import { IImageService } from '@hatsuportal/application'
import { unixtimeNow, uuid } from '@hatsuportal/common'

import { PostId, Image, Base64Image, UserId } from '@hatsuportal/domain'

export class CreateImageUseCase implements ICreateImageUseCase {
  constructor(
    private readonly imageService: IImageService,
    private readonly userRepository: IUserRepository,
    private readonly imageMetadataRepository: IImageMetadataRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly imageMetadataMapper: IImageMetadataApplicationMapper
  ) {}

  async execute({ createImageInput, imageCreated }: ICreateImageUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, createImageData } = createImageInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthenticationError('Must be logged in to create an story.')

      const image = new Image({
        id: uuid(),
        visibility: createImageData.visibility,
        fileName: createImageData.fileName,
        mimeType: createImageData.mimeType,
        size: createImageData.size,
        ownerId: createImageData.ownerId ?? null,
        ownerType: createImageData.ownerType,
        base64: createImageData.base64,
        createdBy: loggedInUser.id.value,
        createdByUserName: loggedInUser.name.value,
        createdAt: unixtimeNow(),
        updatedAt: null
      })
      await this.ensureUniqueId(image.id)

      const resizedBuffer = await this.getResizedImageBuffer(image.base64)
      image.mimeType = await this.imageService.validateMimeType(resizedBuffer, image.fileName)

      this.imageService.writeImageToFileSystem(resizedBuffer, image.storageFileName)

      const newImageMetadata = await this.imageMetadataRepository.insert(image)

      image.base64 = this.imageService.convertBufferToBase64Image(resizedBuffer, image.mimeType)

      image.update(this.imageMetadataMapper.toDTO(newImageMetadata))
      imageCreated(this.imageMapper.toDTO(image))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }

  private async ensureUniqueId(id: PostId): Promise<void> {
    const previousImage = await this.imageMetadataRepository.findById(id)
    if (previousImage) {
      throw new ForbiddenError(`Cannot create image with id ${id} because it already exists.`)
    }
  }

  private async getResizedImageBuffer(base64: Base64Image) {
    const imageBuffer = this.imageService.convertBase64ImageToBuffer(base64)
    return await this.imageService.resizeImageBuffer(imageBuffer)
  }
}
