import {
  AuthenticationError,
  AuthorizationError,
  Base64Image,
  FileName,
  FileSize,
  IImageRepository,
  IUpdateImageUseCase,
  IUpdateImageUseCaseOptions,
  Image,
  ImageCreatorId,
  ImageCreatorName,
  ImageId,
  MimeType,
  NotFoundError
} from '@hatsuportal/common-bounded-context'
import { Logger } from '@hatsuportal/common'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('UpdateImageUseCaseWithValidation')

export class UpdateImageUseCaseWithValidation extends UseCaseWithValidation<IUpdateImageUseCaseOptions> implements IUpdateImageUseCase {
  constructor(
    private readonly useCase: IUpdateImageUseCase,
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateImageUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateImageUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.updateImageInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const existingImage = await this.imageRepository.findById(new ImageId(options.updateImageInput.updateImageData.id))
    if (!existingImage) throw new NotFoundError('Image to update not found.')

    const valid = this.validateAuthorization(loggedInUser, existingImage) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, existingImage: Image): boolean {
    const authorizationResult = this.authorizationService.canUpdateImage(loggedInUser, existingImage)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IUpdateImageUseCaseOptions): boolean {
    const { updateImageData } = options.updateImageInput
    const { fileName, mimeType, size, base64 } = updateImageData

    return (
      this.testArgumentInstance(ImageId, 'updateImageInput.updateImageData.id', options) &&
      ((fileName ?? null) !== null ? this.testArgumentInstance(FileName, 'updateImageInput.updateImageData.fileName', options) : true) &&
      ((mimeType ?? null) !== null ? this.testArgumentInstance(MimeType, 'updateImageInput.updateImageData.mimeType', options) : true) &&
      ((size ?? null) !== null ? this.testArgumentInstance(FileSize, 'updateImageInput.updateImageData.size', options) : true) &&
      ((base64 ?? null) !== null ? this.testArgumentInstance(Base64Image, 'updateImageInput.updateImageData.base64', options) : true) &&
      this.testArgumentInstance(ImageCreatorId, 'updateImageInput.updateImageData.ownerEntityId', options) &&
      this.testArgumentInstance(ImageCreatorName, 'updateImageInput.updateImageData.ownerEntityType', options)
    )
  }
}
