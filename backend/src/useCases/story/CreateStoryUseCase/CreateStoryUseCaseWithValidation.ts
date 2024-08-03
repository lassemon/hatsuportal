import { ICreateStoryUseCase, ICreateStoryUseCaseOptions, Story } from '@hatsuportal/post-management'
import { Logger, unixtimeNow, uuid } from '@hatsuportal/common'
import { AuthenticationError, InvalidInputError } from '@hatsuportal/common-bounded-context'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'

const logger = new Logger('CreateStoryUseCaseWithValidation')

export class CreateStoryUseCaseWithValidation extends UseCaseWithValidation<ICreateStoryUseCaseOptions> implements ICreateStoryUseCase {
  constructor(private readonly useCase: ICreateStoryUseCase, private readonly userRepository: IUserRepository) {
    super(logger)
  }

  async execute(options: ICreateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateStoryUseCase arguments')

    const user = await this.userRepository.findById(new UserId(options.createStoryInput.loggedInUserId))
    const valid =
      this.validateAuthorization(options, user!) && this.validateRequiredFields(options) && this.validateDomainRules(options, user!)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(options: ICreateStoryUseCaseOptions, user: User): boolean {
    // TODO: remove isCreator and use Policy Based Access Control instead
    if (!user || !user.isCreator()) throw new AuthenticationError('Not authorized to create a new story.')

    return true
  }

  private validateRequiredFields(options: ICreateStoryUseCaseOptions): boolean {
    return this.testArgument<'createStoryInput'>('createStoryInput', options, (createStoryInput) => {
      const { name, description, visibility } = createStoryInput.createStoryData
      if (!name) throw new InvalidInputError('Story name is required')
      if (!description) throw new InvalidInputError('Story description is required')
      if (!visibility) throw new InvalidInputError('Story visibility is required')
      return true
    })
  }

  private validateDomainRules(options: ICreateStoryUseCaseOptions, user: User): boolean {
    return this.testArgument<'createStoryInput'>('createStoryInput', options, (createStoryInput) => {
      const {
        createStoryData: { visibility, name, description, image }
      } = createStoryInput
      const now = unixtimeNow()
      return Story.canCreate({
        id: uuid(),
        visibility,
        image,
        name,
        description,
        createdById: user.id.value,
        createdByName: user.name.value,
        createdAt: now,
        updatedAt: now
      })
    })
  }
}
