import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IMediaAuthorizationService } from '../../authorization/services/MediaAuthorizationService'
import { IDeleteImageUseCase } from './DeleteImageUseCase'
import { IDeleteImageUseCaseOptions } from './DeleteImageUseCase'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { CurrentImage, Image, ImageId, IImageRepository } from '../../../domain'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'

const logger = new Logger('DeleteImageUseCaseWithValidation')

export class DeleteImageUseCaseWithValidation extends UseCaseWithValidation<IDeleteImageUseCaseOptions> implements IDeleteImageUseCase {
  constructor(
    private readonly useCase: IDeleteImageUseCase,
    private readonly userGateway: IUserGateway,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly authorizationService: IMediaAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDeleteImageUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateImageUseCase arguments')

    const result = await this.userGateway.getUserById({ userId: options.deletedById })

    if (!result.isSuccess()) throw new AuthenticationError('Not logged in.')

    const existingImage = await this.imageRepository.findById(new ImageId(options.deleteImageInput.imageId))
    if (!existingImage)
      throw new NotFoundError(`Cannot delete image with id '${options.deleteImageInput.imageId}' because it does not exist.`)

    const valid = this.validateAuthorization(result.value, existingImage) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, existingImage: Image): boolean {
    const authorizationResult = this.authorizationService.canDeleteImage(
      loggedInUser,
      this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(existingImage))
    )
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IDeleteImageUseCaseOptions): boolean {
    return this.testArgumentInstance(ImageId, 'deleteImageInput.imageId', options)
  }
}
