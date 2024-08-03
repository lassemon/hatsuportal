import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { ICreateStagedImageVersionUseCase, ICreateStagedImageVersionUseCaseOptions } from './CreateStagedImageVersionUseCase'
import { IMediaAuthorizationService } from '../../authorization/services/MediaAuthorizationService'
import { UserReadModelDTO } from '../../dtos/UserReadModelDTO'
import { AuthenticationError, AuthorizationError, UseCaseWithValidation } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum, Logger } from '@hatsuportal/common'
import { UniqueId } from '@hatsuportal/shared-kernel'
import { Base64Image, FileSize, MimeType } from '../../../domain'

const logger = new Logger('CreateStagedImageVersionUseCaseWithValidation')

export class CreateStagedImageVersionUseCaseWithValidation
  extends UseCaseWithValidation<ICreateStagedImageVersionUseCaseOptions>
  implements ICreateStagedImageVersionUseCase
{
  constructor(
    private readonly useCase: ICreateStagedImageVersionUseCase,
    private readonly userGateway: IUserGateway,
    private readonly authorizationService: IMediaAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ICreateStagedImageVersionUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateStagedImageVersionUseCase arguments')

    const result = await this.userGateway.getUserById({ userId: options.createdById })
    if (!result.isSuccess()) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(result.value) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO): boolean {
    const authorizationResult = this.authorizationService.canCreateImage(loggedInUser)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateStagedImageVersionUseCaseOptions): boolean {
    this.testEnumArgument(EntityTypeEnum, 'createImageInput.ownerEntityType', options)
    this.testArgumentInstance(UniqueId, 'createImageInput.ownerEntityId', options)
    this.testEnumArgument(ImageRoleEnum, 'createImageInput.role', options)
    this.testArgumentInstance(MimeType, 'createImageInput.mimeType', options)
    this.testArgumentInstance(FileSize, 'createImageInput.size', options)
    this.testArgument<'createImageInput'>('createImageInput', options, (createImageInput) => {
      const { base64 } = createImageInput
      Base64Image.assertCanCreate(base64)
      return true
    })

    return true
  }
}
