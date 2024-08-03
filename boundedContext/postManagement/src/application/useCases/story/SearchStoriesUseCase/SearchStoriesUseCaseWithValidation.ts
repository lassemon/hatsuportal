import { isBoolean, isEnumValue, isString, Logger, OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError, UseCaseWithValidation } from '@hatsuportal/platform'
import { ISearchStoriesUseCase, ISearchStoriesUseCaseOptions } from './SearchStoriesUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { UserLoadResult } from '../../../acl/userManagement/outcomes/UserLoadResult'

const logger = new Logger('SearchStoriesUseCaseWithValidation')

export class SearchStoriesUseCaseWithValidation
  extends UseCaseWithValidation<ISearchStoriesUseCaseOptions>
  implements ISearchStoriesUseCase
{
  constructor(
    private readonly useCase: ISearchStoriesUseCase,
    private readonly userGateway: IUserGateway,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ISearchStoriesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating SearchStoriesUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const { loggedInUserId } = options

    const valid = (await this.validateAuthorization(options, loggedInUserId)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(options: ISearchStoriesUseCaseOptions, loggedInUserId?: string): Promise<boolean> {
    const searchCriteria = options.searchCriteria
    const userLoadResult = loggedInUserId ? await this.userGateway.getUserById({ userId: loggedInUserId }) : UserLoadResult.notSet()

    if (loggedInUserId && userLoadResult.isFailed())
      throw new AuthorizationError(`Attempted to search stories logged in as '${loggedInUserId}' but user not found.`)

    const authorizationResult = this.authorizationService.canSearchStories(
      userLoadResult.isNotSet() ? null : userLoadResult.value,
      searchCriteria
    )
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ISearchStoriesUseCaseOptions): boolean {
    const { searchCriteria } = options
    const { onlyMyStories, order, orderBy, search, visibility, hasImage } = searchCriteria

    return (
      this.testArgumentInstance(Number, 'searchCriteria.storiesPerPage', options) &&
      this.testArgumentInstance(Number, 'searchCriteria.pageNumber', options) &&
      this.testArgument<'searchCriteria'>('searchCriteria', options, (searchCriteria) => {
        const { storiesPerPage, pageNumber } = searchCriteria
        if (storiesPerPage < 0) {
          throw new InvalidInputError('Stories per page cannot be negative.')
        }
        if (pageNumber < 0) {
          throw new InvalidInputError('Page number cannot be negative.')
        }
        return true
      }) &&
      ((onlyMyStories ?? null) !== null ? this.testArgumentInstance(Boolean, 'searchCriteria.onlyMyStories', options, isBoolean) : true) &&
      ((order ?? null) !== null ? this.testEnumArgument(OrderEnum, 'searchCriteria.order', options) : true) &&
      ((orderBy ?? null) !== null ? this.testEnumArgument(StorySortableKeyEnum, 'searchCriteria.orderBy', options) : true) &&
      ((search ?? null) !== null ? this.testArgumentInstance(String, 'searchCriteria.search', options, isString) : true) &&
      ((visibility ?? null) !== null
        ? this.testArgument<'searchCriteria'>('searchCriteria', options, (searchCriteria) => {
            const { visibility } = searchCriteria

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
      ((hasImage ?? null) !== null ? this.testArgumentInstance(Boolean, 'searchCriteria.hasImage', options, isBoolean) : true)
    )
  }
}
