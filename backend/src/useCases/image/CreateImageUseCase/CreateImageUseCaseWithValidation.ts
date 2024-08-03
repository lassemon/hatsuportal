import { Logger } from '@hatsuportal/common'
import {
  AuthenticationError,
  AuthorizationError,
  Base64Image,
  FileName,
  FileSize,
  ICreateImageUseCase,
  ICreateImageUseCaseOptions,
  ImageCreatorId,
  ImageCreatorName,
  MimeType,
  UseCaseWithValidation
} from '@hatsuportal/common-bounded-context'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('CreateImageUseCaseWithValidation')

export class CreateImageUseCaseWithValidation extends UseCaseWithValidation<ICreateImageUseCaseOptions> implements ICreateImageUseCase {
  constructor(
    private readonly useCase: ICreateImageUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ICreateImageUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateImageUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.createImageInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    const authorizationResult = this.authorizationService.canCreateImage(loggedInUser)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateImageUseCaseOptions): boolean {
    this.testArgumentInstance(FileName, 'createImageInput.createImageData.fileName', options)
    this.testArgumentInstance(MimeType, 'createImageInput.createImageData.mimeType', options)
    this.testArgumentInstance(FileSize, 'createImageInput.createImageData.size', options)
    this.testArgumentInstance(Base64Image, 'createImageInput.createImageData.base64', options)
    this.testArgumentInstance(ImageCreatorId, 'createImageInput.createImageData.ownerEntityId', options)
    this.testArgumentInstance(ImageCreatorName, 'createImageInput.createImageData.ownerEntityType', options)

    return true
  }
}
