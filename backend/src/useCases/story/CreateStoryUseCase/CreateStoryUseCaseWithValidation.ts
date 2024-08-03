import { ICreateStoryUseCase, ICreateStoryUseCaseOptions, IStoryFactory } from '@hatsuportal/post-management'
import { EntityTypeEnum, Logger, unixtimeNow, uuid } from '@hatsuportal/common'
import { AuthenticationError, AuthorizationError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('CreateStoryUseCaseWithValidation')

export class CreateStoryUseCaseWithValidation extends UseCaseWithValidation<ICreateStoryUseCaseOptions> implements ICreateStoryUseCase {
  constructor(
    private readonly useCase: ICreateStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly storyFactory: IStoryFactory
  ) {
    super(logger)
  }

  async execute(options: ICreateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateStoryUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.createStoryInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options, loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    const authorizationResult = this.authorizationService.canCreateStory(loggedInUser)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateStoryUseCaseOptions, loggedInUser: User): boolean {
    return this.testArgument<'createStoryInput'>('createStoryInput', options, (createStoryInput) => {
      const { visibility, name, description, image } = createStoryInput.createStoryData

      const dummyStoryId = uuid()

      // Create story creation input props with actual user input
      // fill in the missing mandatory props with dummy values
      const storyProps = {
        id: dummyStoryId,
        name,
        description,
        visibility,
        image: image
          ? {
              id: uuid(),
              fileName: uuid(),
              mimeType: image.mimeType,
              size: image.size,
              ownerEntityId: dummyStoryId,
              ownerEntityType: EntityTypeEnum.Story,
              base64: image.base64,
              createdById: loggedInUser.id.value,
              createdByName: loggedInUser.name.value,
              createdAt: unixtimeNow(),
              updatedAt: unixtimeNow()
            }
          : null,
        createdById: loggedInUser.id.value,
        createdByName: loggedInUser.name.value,
        createdAt: unixtimeNow(),
        updatedAt: unixtimeNow()
      }

      const result = this.storyFactory.createStory(storyProps)

      return result.match(
        () => true,
        (error) => {
          throw error
        }
      )
    })
  }
}
