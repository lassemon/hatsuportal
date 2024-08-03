import {
  AuthenticationError,
  AuthorizationError,
  IImageRepository,
  IUpdateImageUseCase,
  IUpdateImageUseCaseOptions,
  Image,
  ImageId,
  NotFoundError
} from '@hatsuportal/common-bounded-context'
import { Logger } from '@hatsuportal/common'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'

const logger = new Logger('UpdateImageUseCaseWithValidation')

export class UpdateImageUseCaseWithValidation extends UseCaseWithValidation<IUpdateImageUseCaseOptions> implements IUpdateImageUseCase {
  constructor(
    private readonly useCase: IUpdateImageUseCase,
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository
  ) {
    super(logger)
  }

  async execute(options: IUpdateImageUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateImageUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.updateImageInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const existingImage = await this.imageRepository.findById(new ImageId(options.updateImageInput.updateImageData.id))
    if (!existingImage) throw new NotFoundError('Image to update not found.')

    const valid = this.validateAuthorization(loggedInUser, existingImage) && this.validateDomainRules(options, existingImage)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, existingImage: Image): boolean {
    if (existingImage.createdById.value !== loggedInUser.id.value)
      throw new AuthorizationError('Cannot update image that is not created by you.')

    return true
  }

  private validateDomainRules(options: IUpdateImageUseCaseOptions, existingImage: Image): boolean {
    return this.testArgument<'updateImageInput'>('updateImageInput', options, (updateImageInput) => {
      const { updateImageData } = updateImageInput

      // update function throws error if input is invalid
      existingImage.update(updateImageData)

      return true
    })
  }
}
