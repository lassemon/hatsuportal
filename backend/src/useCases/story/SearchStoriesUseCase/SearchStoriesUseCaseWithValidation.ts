import { Logger, OrderEnum, StorySortableKeyEnum, VisibilityEnum, isBoolean, isEnumValue, isString } from '@hatsuportal/common'
import { AuthenticationError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { InvalidInputError } from '@hatsuportal/common-bounded-context/src'
import { ISearchStoriesUseCase, ISearchStoriesUseCaseOptions } from '@hatsuportal/post-management'
import { IUserRepository, UserId } from '@hatsuportal/user-management'

const logger = new Logger('SearchStoriesUseCaseWithValidation')

export class SearchStoriesUseCaseWithValidation
  extends UseCaseWithValidation<ISearchStoriesUseCaseOptions>
  implements ISearchStoriesUseCase
{
  constructor(private readonly useCase: ISearchStoriesUseCase, private readonly userRepository: IUserRepository) {
    super(logger)
  }

  async execute(options: ISearchStoriesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating SearchStoriesUseCase arguments')
    const {
      searchStoriesInput: { loggedInUserId }
    } = options

    const valid = (await this.validateAuthorization(options, loggedInUserId)) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(options: ISearchStoriesUseCaseOptions, loggedInUserId?: string): Promise<boolean> {
    const { searchCriteria } = options.searchStoriesInput
    if (!loggedInUserId && searchCriteria.visibility) {
      throw new InvalidInputError('Cannot filter by visibility if not logged in.')
    } else if (loggedInUserId) {
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser) throw new AuthenticationError('Not logged in.')
    }

    return true
  }

  private validateDomainRules(options: ISearchStoriesUseCaseOptions): boolean {
    const {
      searchStoriesInput: { searchCriteria }
    } = options

    return (
      this.testArgumentInstance(Number, 'searchStoriesInput.searchCriteria.storiesPerPage', options) &&
      this.testArgumentInstance(Number, 'searchStoriesInput.searchCriteria.pageNumber', options) &&
      ((searchCriteria.onlyMyStories ?? null) !== null
        ? this.testArgumentInstance(Boolean, 'searchStoriesInput.searchCriteria.onlyMyStories', options, isBoolean)
        : true) &&
      ((searchCriteria.order ?? null) !== null
        ? this.testEnumArgument(OrderEnum, 'searchStoriesInput.searchCriteria.order', options)
        : true) &&
      ((searchCriteria.orderBy ?? null) !== null
        ? this.testEnumArgument(StorySortableKeyEnum, 'searchStoriesInput.searchCriteria.orderBy', options)
        : true) &&
      ((searchCriteria.search ?? null) !== null
        ? this.testArgumentInstance(String, 'searchStoriesInput.searchCriteria.search', options, isString)
        : true) &&
      this.testArgument<'searchStoriesInput'>('searchStoriesInput', options, (searchStoriesInput) => {
        const { visibility } = searchStoriesInput.searchCriteria

        if (visibility && visibility.length > 0) {
          visibility.forEach((visibility) => {
            if (!isEnumValue(visibility, VisibilityEnum)) {
              throw new InvalidInputError(`Invalid visibility '${visibility}'.`)
            }
          })
        }

        return true
      }) &&
      ((searchCriteria.hasImage ?? null) !== null
        ? this.testArgumentInstance(Boolean, 'searchStoriesInput.searchCriteria.hasImage', options, isBoolean)
        : true)
    )
  }
}
