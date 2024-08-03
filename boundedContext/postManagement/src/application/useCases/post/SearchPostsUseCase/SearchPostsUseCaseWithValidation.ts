import { EntityTypeEnum, isEnumValue, isString, Logger, OrderEnum, SortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError, UseCaseWithValidation } from '@hatsuportal/platform'
import { ISearchPostsUseCase, ISearchPostsUseCaseOptions } from './SearchPostsUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { IStoryAuthorizationService } from '../../../authorization/services/StoryAuthorizationService'
import { UserLoadResult } from '../../../acl/userManagement/outcomes/UserLoadResult'
import { IPostApplicationMapper } from '../../../mappers/PostApplicationMapper'

const logger = new Logger('SearchPostsUseCaseWithValidation')

export class SearchPostsUseCaseWithValidation extends UseCaseWithValidation<ISearchPostsUseCaseOptions> implements ISearchPostsUseCase {
  constructor(
    private readonly useCase: ISearchPostsUseCase,
    private readonly userGateway: IUserGateway,
    private readonly postApplicationMapper: IPostApplicationMapper,
    private readonly authorizationService: IStoryAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ISearchPostsUseCaseOptions): Promise<void> {
    this.logger.debug('Validating SearchPostsUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const { loggedInUserId } = options

    const valid = (await this.validateAuthorization(options, loggedInUserId)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private isStoryPostTypeSearch(postType: EntityTypeEnum | undefined): boolean {
    return postType === undefined || postType === EntityTypeEnum.Story
  }

  private async validateAuthorization(options: ISearchPostsUseCaseOptions, loggedInUserId?: string): Promise<boolean> {
    if (!this.isStoryPostTypeSearch(options.searchCriteria.postType)) {
      // No story search; empty result path — story search authorization does not apply.
      return true
    }

    const userLoadResult = loggedInUserId ? await this.userGateway.getUserById({ userId: loggedInUserId }) : UserLoadResult.notSet()

    if (loggedInUserId && userLoadResult.isFailed()) {
      throw new AuthorizationError(`Attempted to search posts logged in as '${loggedInUserId}' but user not found.`)
    }

    const storyCriteria = this.postApplicationMapper.toStorySearchCriteria(options.searchCriteria)
    const authorizationResult = this.authorizationService.canSearchStories(
      userLoadResult.isNotSet() ? null : userLoadResult.value,
      storyCriteria
    )
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ISearchPostsUseCaseOptions): boolean {
    const { searchCriteria } = options
    const { order, orderBy, search, visibility, postType } = searchCriteria

    return (
      this.testArgumentInstance(Number, 'searchCriteria.postsPerPage', options) &&
      this.testArgumentInstance(Number, 'searchCriteria.pageNumber', options) &&
      this.testArgument<'searchCriteria'>('searchCriteria', options, (searchCriteria) => {
        const { postsPerPage, pageNumber } = searchCriteria
        if (postsPerPage < 0) {
          throw new InvalidInputError('Posts per page cannot be negative.')
        }
        if (pageNumber < 0) {
          throw new InvalidInputError('Page number cannot be negative.')
        }
        return true
      }) &&
      ((order ?? null) !== null ? this.testEnumArgument(OrderEnum, 'searchCriteria.order', options) : true) &&
      ((orderBy ?? null) !== null ? this.testEnumArgument(SortableKeyEnum, 'searchCriteria.orderBy', options) : true) &&
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
      ((postType ?? null) !== null
        ? this.testArgument<'searchCriteria'>('searchCriteria', options, (searchCriteria) => {
            const { postType } = searchCriteria
            if (postType !== undefined && !isEnumValue(postType, EntityTypeEnum)) {
              throw new InvalidInputError(`Invalid post type '${postType}'.`)
            }
            return true
          })
        : true)
    )
  }
}
