import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IMediaAuthorizationService } from '../../authorization/services/MediaAuthorizationService'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'
import { Image, ImageId, ImageVersionId } from '../../../domain'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IDiscardImageVersionUseCase, IDiscardImageVersionUseCaseOptions } from './DiscardImageVersionUseCase'
import { IImageLookupService } from '../../services/image/ImageLookupService'

const logger = new Logger('DiscardImageVersionUseCaseWithValidation')

export class DiscardImageVersionUseCaseWithValidation
  extends UseCaseWithValidation<IDiscardImageVersionUseCaseOptions>
  implements IDiscardImageVersionUseCase
{
  constructor(
    private readonly useCase: IDiscardImageVersionUseCase,
    private readonly userGateway: IUserGateway,
    private readonly imageLookupService: IImageLookupService,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly authorizationService: IMediaAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDiscardImageVersionUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DiscardImageVersionUseCase arguments')

    const result = await this.userGateway.getUserById({ userId: options.discardedById })

    if (!result.isSuccess()) throw new AuthenticationError('Not logged in.')

    if (!this.validateDomainRules(options)) return

    const stagedVersionId = new ImageVersionId(options.stagedVersionId)
    const existingImage = await this.imageLookupService.findByIdAndVersionId(new ImageId(options.imageId), stagedVersionId)
    if (!existingImage) {
      throw new NotFoundError(`Cannot discard image '${options.imageId}' because it does not exist.`)
    }

    if (!this.validateAuthorization(result.value, existingImage, stagedVersionId)) return

    await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, existingImage: Image, versionId: ImageVersionId): boolean {
    const authorizationResult = this.authorizationService.canUpdateImage(
      loggedInUser,
      this.imageMapper.toDTOFromVersion(existingImage, versionId)
    )
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IDiscardImageVersionUseCaseOptions): boolean {
    return this.testArgumentInstance(ImageId, 'imageId', options) && this.testArgumentInstance(ImageVersionId, 'stagedVersionId', options)
  }
}
