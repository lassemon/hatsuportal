import { UseCaseWithValidation, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { NonEmptyString, PositiveInteger } from '@hatsuportal/shared-kernel'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { ICreateStoryUseCase, ICreateStoryUseCaseOptions } from '../CreateStoryUseCase'
import { PostVisibility } from '../../../../domain'

const logger = new Logger('CreateStoryUseCaseWithValidation')

export class CreateStoryUseCaseWithValidation extends UseCaseWithValidation<ICreateStoryUseCaseOptions> implements ICreateStoryUseCase {
  constructor(
    private readonly useCase: ICreateStoryUseCase,
    private readonly userGateway: IUserGateway,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ICreateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateStoryUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const loadResult = await this.userGateway.getUserById({ userId: options.createdById })
    if (loadResult.isFailed()) throw new AuthorizationError('Not logged in.')

    const valid = this.validateAuthorization(loadResult.value) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO): boolean {
    const authorizationResult = this.authorizationService.canCreateStory({
      id: loggedInUser.id,
      roles: loggedInUser.roles,
      active: loggedInUser.active
    })
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateStoryUseCaseOptions): boolean {
    const { image } = options.createStoryInput
    this.testArgumentInstance(PostVisibility, 'createStoryInput.visibility', options)
    this.testArgumentInstance(NonEmptyString, 'createStoryInput.name', options)
    this.testArgumentInstance(NonEmptyString, 'createStoryInput.description', options)

    if (image) {
      this.testArgumentInstance(NonEmptyString, 'createStoryInput.image.mimeType', options)
      this.testArgumentInstance(PositiveInteger, 'createStoryInput.image.size', options)
      this.testArgumentInstance(NonEmptyString, 'createStoryInput.image.base64', options)
    }

    return true
  }
}
