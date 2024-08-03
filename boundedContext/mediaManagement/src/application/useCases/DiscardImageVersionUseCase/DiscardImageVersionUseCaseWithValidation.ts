import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IMediaAuthorizationService } from '../../authorization/services/MediaAuthorizationService'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'
import { CurrentImage, Image, ImageId, IImageRepository, ImageVersionId } from '../../../domain'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IDiscardImageVersionUseCase, IDiscardImageVersionUseCaseOptions } from './DiscardImageVersionUseCase'

const logger = new Logger('DiscardImageVersionUseCaseWithValidation')

export class DiscardImageVersionUseCaseWithValidation
  extends UseCaseWithValidation<IDiscardImageVersionUseCaseOptions>
  implements IDiscardImageVersionUseCase
{
  constructor(
    private readonly useCase: IDiscardImageVersionUseCase,
    private readonly userGateway: IUserGateway,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly authorizationService: IMediaAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDiscardImageVersionUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DiscardImageVersionUseCase arguments')

    const result = await this.userGateway.getUserById({ userId: options.discardedById })

    if (!result.isSuccess()) throw new AuthenticationError('Not logged in.')

    const existingImage = await this.imageRepository.findById(new ImageId(options.imageId))
    if (!existingImage) {
      throw new NotFoundError(`Cannot discard image '${options.imageId}' because it does not exist.`)
    }

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

  private validateDomainRules(options: IDiscardImageVersionUseCaseOptions): boolean {
    return this.testArgumentInstance(ImageId, 'imageId', options) && this.testArgumentInstance(ImageVersionId, 'stagedVersionId', options)
  }
}
