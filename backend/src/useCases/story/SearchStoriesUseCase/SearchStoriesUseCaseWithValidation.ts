import { Logger, OrderEnum, StorySortableKeyEnum, VisibilityEnum, isBoolean, isEnumValue, isString } from '@hatsuportal/common'
import { AuthorizationError, UseCaseWithValidation, InvalidInputError } from '@hatsuportal/common-bounded-context'
import { ISearchStoriesUseCase, ISearchStoriesUseCaseOptions } from '@hatsuportal/post-management'
import { IUserRepository, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('SearchStoriesUseCaseWithValidation')

export class SearchStoriesUseCaseWithValidation
  extends UseCaseWithValidation<ISearchStoriesUseCaseOptions>
  implements ISearchStoriesUseCase
{
  constructor(
    private readonly useCase: ISearchStoriesUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
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
    const loggedInUser = loggedInUserId ? await this.userRepository.findById(new UserId(loggedInUserId)) : null
    const authorizationResult = this.authorizationService.canSearchStories(loggedInUser, searchCriteria)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ISearchStoriesUseCaseOptions): boolean {
    const {
      searchStoriesInput: { searchCriteria }
    } = options
    const { onlyMyStories, order, orderBy, search, visibility, hasImage } = searchCriteria

    return (
      this.testArgumentInstance(Number, 'searchStoriesInput.searchCriteria.storiesPerPage', options) &&
      this.testArgumentInstance(Number, 'searchStoriesInput.searchCriteria.pageNumber', options) &&
      ((onlyMyStories ?? null) !== null
        ? this.testArgumentInstance(Boolean, 'searchStoriesInput.searchCriteria.onlyMyStories', options, isBoolean)
        : true) &&
      ((order ?? null) !== null ? this.testEnumArgument(OrderEnum, 'searchStoriesInput.searchCriteria.order', options) : true) &&
      ((orderBy ?? null) !== null
        ? this.testEnumArgument(StorySortableKeyEnum, 'searchStoriesInput.searchCriteria.orderBy', options)
        : true) &&
      ((search ?? null) !== null
        ? this.testArgumentInstance(String, 'searchStoriesInput.searchCriteria.search', options, isString)
        : true) &&
      ((visibility ?? null) !== null
        ? this.testArgument<'searchStoriesInput'>('searchStoriesInput', options, (searchStoriesInput) => {
            const { visibility } = searchStoriesInput.searchCriteria

            if (visibility && visibility.length > 0) {
              visibility.forEach((visibility) => {
                if (!isEnumValue(visibility, VisibilityEnum)) {
                  throw new InvalidInputError(`Invalid visibility '${visibility}'.`)
                }
              })
            }

            return true
          })
        : true) &&
      ((hasImage ?? null) !== null
        ? this.testArgumentInstance(Boolean, 'searchStoriesInput.searchCriteria.hasImage', options, isBoolean)
        : true)
    )
  }
}
