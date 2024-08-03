import {
  ApplicationError,
  AuthenticationError,
  IImageApplicationMapper,
  IUpdateImageUseCase,
  IUpdateImageUseCaseOptions,
  NotFoundError
} from '@hatsuportal/application'

import { PostId, UserId, IUserRepository, IImageRepository } from '@hatsuportal/domain'
import _ from 'lodash'

export class UpdateImageUseCase implements IUpdateImageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper
  ) {}

  async execute({ updateImageInput, imageUpdated }: IUpdateImageUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, updateImageData } = updateImageInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser || !loggedInUser.isAdmin()) throw new AuthenticationError('Must be logged in to update an story.')

      const existingImage = await this.imageRepository.findById(new PostId(updateImageData.id))
      if (!existingImage) {
        throw new NotFoundError(`Cannot update image with id ${updateImageData.id} because it does not exist.`)
      }

      const updatedImage = await this.imageRepository.update(existingImage)

      existingImage.update(this.imageMapper.toDTO(updatedImage))
      imageUpdated(this.imageMapper.toDTO(existingImage))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
