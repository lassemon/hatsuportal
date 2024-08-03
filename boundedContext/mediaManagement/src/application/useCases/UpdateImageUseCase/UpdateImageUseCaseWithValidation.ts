import { IMediaAuthorizationService } from '../../authorization/services/MediaAuthorizationService'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IUpdateImageUseCase, IUpdateImageUseCaseOptions } from './UpdateImageUseCase'
import { AuthenticationError, NotFoundError, AuthorizationError } from '@hatsuportal/platform'
import { Base64Image, FileSize, Image, ImageId, MimeType, IImageRepository, CurrentImage } from '../../../domain'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'

const logger = new Logger('UpdateImageUseCaseWithValidation')

export class UpdateImageUseCaseWithValidation extends UseCaseWithValidation<IUpdateImageUseCaseOptions> implements IUpdateImageUseCase {
  constructor(
    private readonly useCase: IUpdateImageUseCase,
    private readonly userGateway: IUserGateway,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly authorizationService: IMediaAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateImageUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateImageUseCase arguments')

    const result = await this.userGateway.getUserById({ userId: options.updatedById })

    if (!result.isSuccess()) throw new AuthenticationError('Not logged in.')

    const existingImage = await this.imageRepository.findById(new ImageId(options.updateImageInput.id))
    if (!existingImage) throw new NotFoundError(`Cannot update image with id '${options.updateImageInput.id}' because it does not exist.`)

    const valid = this.validateAuthorization(result.value, existingImage) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, existingImage: Image): boolean {
    const authorizationResult = this.authorizationService.canUpdateImage(
      loggedInUser,
      this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(existingImage))
    )
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IUpdateImageUseCaseOptions): boolean {
    const { mimeType, size, base64 } = options.updateImageInput

    return (
      this.testArgumentInstance(ImageId, 'updateImageInput.id', options) &&
      ((mimeType ?? null) !== null ? this.testArgumentInstance(MimeType, 'updateImageInput.mimeType', options) : true) &&
      ((size ?? null) !== null ? this.testArgumentInstance(FileSize, 'updateImageInput.size', options) : true) &&
      ((base64 ?? null) !== null
        ? this.testArgument<'updateImageInput'>('updateImageInput', options, (updateImageInput) => {
            const { base64 } = updateImageInput
            Base64Image.assertCanCreate(base64)
            return true
          })
        : true)
    )
  }
}
