import {
  ApplicationError,
  AuthenticationError,
  ForbiddenError,
  ICreateImageUseCase,
  ICreateImageUseCaseOptions,
  IImageApplicationMapper
} from '@hatsuportal/application'
import { unixtimeNow, uuid } from '@hatsuportal/common'

import { PostId, Image, UserId, IUserRepository, IImageRepository } from '@hatsuportal/domain'

export class CreateImageUseCase implements ICreateImageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper
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
        ownerId: createImageData.ownerId,
        ownerType: createImageData.ownerType,
        base64: createImageData.base64,
        createdBy: loggedInUser.id.value,
        createdByUserName: loggedInUser.name.value,
        createdAt: unixtimeNow(),
        updatedAt: null
      })
      await this.ensureUniqueId(image.id)

      const newImage = await this.imageRepository.insert(image)

      image.update(this.imageMapper.toDTO(newImage))
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
    const previousImage = await this.imageRepository.findById(id)
    if (previousImage) {
      throw new ForbiddenError(`Cannot create image with id ${id} because it already exists.`)
    }
  }
}
