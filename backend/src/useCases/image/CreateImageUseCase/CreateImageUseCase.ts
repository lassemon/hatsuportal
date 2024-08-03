import { IDomainEventDispatcher, IImageApplicationMapper, IImageFactory } from '@hatsuportal/common-bounded-context'
import { IUserRepository, UserId } from '@hatsuportal/user-management'
import { Logger, unixtimeNow, uuid } from '@hatsuportal/common'
import { ApplicationError } from '@hatsuportal/common-bounded-context'
import { ICreateImageUseCase, ICreateImageUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { Image, IImageRepository } from '@hatsuportal/common-bounded-context'

const logger = new Logger('CreateImageUseCase')

export class CreateImageUseCase implements ICreateImageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly eventDispatcher: IDomainEventDispatcher,
    private readonly imageFactory: IImageFactory
  ) {}

  async execute({ createImageInput, imageCreated }: ICreateImageUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, createImageData } = createImageInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))

      const now = unixtimeNow()

      const result = this.imageFactory.createImage({
        id: uuid(),
        fileName: createImageData.fileName,
        mimeType: createImageData.mimeType,
        size: createImageData.size,
        ownerEntityId: createImageData.ownerEntityId,
        ownerEntityType: createImageData.ownerEntityType,
        base64: createImageData.base64,
        // Logged in user is not null because we already checked for it in the validation
        createdById: loggedInUser!.id.value,
        createdByName: loggedInUser!.name.value,
        createdAt: now,
        updatedAt: now
      })

      if (result.isFailure()) {
        throw result.error
      }

      const newImage = await this.imageRepository.insert(result.value)

      imageCreated(this.imageMapper.toDTO(await this.dispatchEvents(newImage)))
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }

  private async dispatchEvents(image: Image): Promise<Image> {
    for (const event of image!.domainEvents) {
      logger.debug(`Dispatching event ${event.eventType} for ${image!.id.value}`)
      await this.eventDispatcher.dispatch(event)
    }
    image!.clearEvents()

    return image
  }
}
