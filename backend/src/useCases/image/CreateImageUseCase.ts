import { IImageApplicationMapper } from '@hatsuportal/common-bounded-context'
import { IUserRepository, UserId } from '@hatsuportal/user-management'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { AuthenticationError, ApplicationError } from '@hatsuportal/common-bounded-context'
import { ICreateImageUseCase, ICreateImageUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { Image, IImageRepository } from '@hatsuportal/common-bounded-context'

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

      const now = unixtimeNow()

      const image = new Image({
        id: uuid(),
        fileName: createImageData.fileName,
        mimeType: createImageData.mimeType,
        size: createImageData.size,
        ownerEntityId: createImageData.ownerEntityId,
        ownerEntityType: createImageData.ownerEntityType,
        base64: createImageData.base64,
        createdById: loggedInUser.id.value,
        createdByName: loggedInUser.name.value,
        createdAt: now,
        updatedAt: now
      })

      const newImage = await this.imageRepository.insert(image)

      image.update(this.imageMapper.toDTO(newImage))
      imageCreated(this.imageMapper.toDTO(image))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
