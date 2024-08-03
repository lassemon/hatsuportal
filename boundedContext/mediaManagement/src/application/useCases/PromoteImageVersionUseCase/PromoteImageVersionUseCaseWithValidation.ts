import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IMediaAuthorizationService } from '../../authorization/services/MediaAuthorizationService'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'
import { CurrentImage, Image, ImageId, IImageRepository, ImageVersionId } from '../../../domain'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IPromoteImageVersionUseCase, IPromoteImageVersionUseCaseOptions } from './PromoteImageVersionUseCase'

const logger = new Logger('PromoteImageVersionUseCaseWithValidation')

export class PromoteImageVersionUseCaseWithValidation
  extends UseCaseWithValidation<IPromoteImageVersionUseCaseOptions>
  implements IPromoteImageVersionUseCase
{
  constructor(
    private readonly useCase: IPromoteImageVersionUseCase,
    private readonly userGateway: IUserGateway,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly authorizationService: IMediaAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IPromoteImageVersionUseCaseOptions): Promise<void> {
    this.logger.debug('Validating PromoteImageVersionUseCase arguments')

    const result = await this.userGateway.getUserById({ userId: options.promotedById })

    if (!result.isSuccess()) throw new AuthenticationError('Not logged in.')

    const existingImage = await this.imageRepository.findById(new ImageId(options.imageId))
    if (!existingImage) throw new NotFoundError(`Cannot promote image '${options.imageId}' because it does not exist.`)

    const valid = this.validateDomainRules(options) && this.validateAuthorization(result.value, existingImage)

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

  private validateDomainRules(options: IPromoteImageVersionUseCaseOptions): boolean {
    return this.testArgumentInstance(ImageId, 'imageId', options) && this.testArgumentInstance(ImageVersionId, 'stagedVersionId', options)
  }
}
