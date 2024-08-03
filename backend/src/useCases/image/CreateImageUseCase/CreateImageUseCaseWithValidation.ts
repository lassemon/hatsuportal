import { Logger, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  AuthenticationError,
  AuthorizationError,
  ICreateImageUseCase,
  ICreateImageUseCaseOptions,
  IImageFactory,
  UseCaseWithValidation
} from '@hatsuportal/common-bounded-context'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('CreateImageUseCaseWithValidation')

export class CreateImageUseCaseWithValidation extends UseCaseWithValidation<ICreateImageUseCaseOptions> implements ICreateImageUseCase {
  constructor(
    private readonly useCase: ICreateImageUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly imageFactory: IImageFactory
  ) {
    super(logger)
  }

  async execute(options: ICreateImageUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateImageUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.createImageInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options, loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    const authorizationResult = this.authorizationService.canCreateImage(loggedInUser)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateImageUseCaseOptions, loggedInUser: User): boolean {
    return this.testArgument<'createImageInput'>('createImageInput', options, (createImageInput) => {
      const { fileName, mimeType, size, ownerEntityId, ownerEntityType, base64 } = createImageInput.createImageData

      // Create image creation input props with actual user input
      // fill in the missing mandatory props with dummy values
      const imageProps = {
        id: uuid(),
        fileName,
        mimeType,
        size,
        ownerEntityId,
        ownerEntityType,
        base64,
        createdById: loggedInUser.id.value,
        createdByName: loggedInUser.name.value,
        createdAt: unixtimeNow(),
        updatedAt: unixtimeNow()
      }

      const result = this.imageFactory.createImage(imageProps)

      return result.match(
        () => true,
        (error) => {
          throw error
        }
      )
    })
  }
}
