import {
  ApplicationError,
  AuthenticationError,
  IImageApplicationMapper,
  IImageMetadataApplicationMapper,
  IImageService,
  InvalidInputError,
  IUpdateImageUseCase,
  IUpdateImageUseCaseOptions,
  NotFoundError
} from '@hatsuportal/application'

import { ImageMetadata, IImageMetadataRepository, IUserRepository, PostId, Base64Image, Image, UserId } from '@hatsuportal/domain'
import _ from 'lodash'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('UpdateImageUseCase')

export class UpdateImageUseCase implements IUpdateImageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageService: IImageService,
    private readonly imageMetadataRepository: IImageMetadataRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly imageMetadataMapper: IImageMetadataApplicationMapper
  ) {}

  async execute({ updateImageInput, imageUpdated }: IUpdateImageUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, updateImageData } = updateImageInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthenticationError('Must be logged in to update an story.')

      const existingImageMetadata = await this.imageMetadataRepository.findById(new PostId(updateImageData.id))
      if (!existingImageMetadata) {
        throw new NotFoundError(`Cannot update image with id ${updateImageData.id} because it does not exist.`)
      }

      existingImageMetadata.update(updateImageData)

      const resizedBuffer = await this.getResizedImageBuffer(new Base64Image(updateImageData.base64))
      const mimeType = await this.imageService.getBufferMimeType(resizedBuffer)
      if (!mimeType) {
        throw new InvalidInputError('Could not parse MimeType from base64 encoded image')
      }

      existingImageMetadata.mimeType = mimeType
      this.imageService.writeImageToFileSystem(resizedBuffer, existingImageMetadata.storageFileName)
      const base64 = this.imageService.convertBufferToBase64Image(resizedBuffer, existingImageMetadata.mimeType)

      // Image can be removed at this point, before creating the new one,
      // because currently using 1to1 relatioship between an image
      // and an story. No image can belong to multiple stories
      await this.removeImage(existingImageMetadata)

      const newImageMetadata = await this.imageMetadataRepository.insert(existingImageMetadata)
      const image = new Image({
        ...this.imageMetadataMapper.toDTO(newImageMetadata),
        base64
      })
      imageUpdated(this.imageMapper.toDTO(image))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }

  private async getResizedImageBuffer(base64: Base64Image) {
    const imageBuffer = this.imageService.convertBase64ImageToBuffer(base64)
    return await this.imageService.resizeImageBuffer(imageBuffer)
  }

  private async removeImage(existingImageMetadata: ImageMetadata) {
    try {
      await this.imageService.deleteImageFromFileSystem(existingImageMetadata.storageFileName)
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error.message || error.stack)
      } else {
        logger.error(error)
      }
    }
    await this.imageMetadataRepository.delete(existingImageMetadata.id)
  }
}
