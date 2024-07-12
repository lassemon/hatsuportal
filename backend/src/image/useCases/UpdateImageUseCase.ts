import {
  ImageMapperInterface,
  ImageServiceInterface,
  InsertImageMetadataQueryDTO,
  UpdateImageMetadataQueryDTO,
  UpdateImageRequestDTO,
  UseCaseInterface,
  UseCaseOptionsInterface
} from '@hatsuportal/application'

import { ApiError, ImageDTO, ImageMetadata, ImageMetadataRepositoryInterface } from '@hatsuportal/domain'
import _ from 'lodash'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('UpdateImageUseCase')

export interface UpdateImageUseCaseOptions extends UseCaseOptionsInterface {
  updateImageRequest: UpdateImageRequestDTO
  previousFileName?: string
}

export type UpdateImageUseCaseInterface = UseCaseInterface<UpdateImageUseCaseOptions, ImageDTO>

export class UpdateImageUseCase implements UpdateImageUseCaseInterface {
  constructor(
    private readonly imageService: ImageServiceInterface,
    private readonly imageMetadataRepository: ImageMetadataRepositoryInterface<InsertImageMetadataQueryDTO, UpdateImageMetadataQueryDTO>,
    private readonly imageMapper: ImageMapperInterface
  ) {}

  async execute({ updateImageRequest }: UpdateImageUseCaseOptions): Promise<ImageDTO> {
    const existingImageMetadata = await this.imageMetadataRepository.findById(updateImageRequest.id)
    if (!existingImageMetadata) {
      throw new ApiError(405, 'MethodNotAllowed', `Cannot update image with id ${updateImageRequest.id} because it does not exist.`)
    }
    const imageMetadata = this.imageMapper.updateRequestToImageMetadata(existingImageMetadata, updateImageRequest)
    const imageBuffer = this.imageService.convertBase64ImageToBuffer(updateImageRequest.base64)
    const resizedBuffer = await this.imageService.resizeImageBuffer(imageBuffer)
    const mimeType = await this.imageService.getBufferMimeType(resizedBuffer)
    if (!mimeType) {
      throw new ApiError(422, 'UnprocessableContent', 'Could not parse MimeType from base64 encoded image')
    }

    imageMetadata.mimeType = mimeType
    const fileNameToUpdate = this.imageService.parseImageFilename(imageMetadata)
    imageMetadata.fileName = fileNameToUpdate
    this.imageService.writeImageToFileSystem(resizedBuffer, imageMetadata)
    const base64 = this.imageService.convertBufferToBase64Image(resizedBuffer, imageMetadata)

    // Image can be removed at this point, before creating the new one,
    // because currently using 1to1 relatioship between an image
    // and an item. No image can belong to multiple items
    await this.removeImage(existingImageMetadata)

    const newImageMetadata = await this.imageMetadataRepository.insert(this.imageMapper.toInsertQuery(imageMetadata.serialize()))
    return {
      ...newImageMetadata.serialize(),
      base64
    }
  }

  private async removeImage(existingImageMetadata: ImageMetadata) {
    try {
      await this.imageService.deleteImageFromFileSystem(existingImageMetadata.fileName)
    } catch (error) {
      logger.error((error as any).message || (error as any).stack || error)
    }
    await this.imageMetadataRepository.delete(existingImageMetadata.id)
  }
}
