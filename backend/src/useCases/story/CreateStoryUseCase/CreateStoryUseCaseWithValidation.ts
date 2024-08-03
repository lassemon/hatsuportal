import { ICreateStoryUseCase, ICreateStoryUseCaseOptions, InvalidInputError, UseCaseWithValidation } from '@hatsuportal/application'
import { Logger, unixtimeNow, uuid } from '@hatsuportal/common'
import { IUserRepository, Story, User, UserId } from '@hatsuportal/domain'

const logger = new Logger('CreateStoryUseCaseWithValidation')

export class CreateStoryUseCaseWithValidation extends UseCaseWithValidation<ICreateStoryUseCaseOptions> implements ICreateStoryUseCase {
  constructor(private readonly useCase: ICreateStoryUseCase, private readonly userRepository: IUserRepository) {
    super(logger)
  }

  async execute(options: ICreateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateStoryUseCase arguments')

    const user = await this.userRepository.findById(new UserId(options.createStoryInput.loggedInUserId))
    const valid = this.validateRequiredFields(options) && this.validateDomainRules(options, user!)

    if (valid) await this.useCase.execute(options)
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
      return Story.canCreate({
        id: uuid(),
        visibility,
        image,
        name,
        description,
        createdBy: user.id.value,
        createdByUserName: user.name.value,
        createdAt: unixtimeNow(),
        updatedAt: null
      })
    })
  }
}
