import { isEmpty as _isEmpty, orderBy as _orderBy, without as _without } from 'lodash'
import { Logger, omitNullAndUndefinedAndEmpty, OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { StorySearchCriteriaDTO, StoryWithRelationsDTO } from '../../../dtos'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { UserLoadResult } from '../../../acl/userManagement/outcomes/UserLoadResult'
import { PostCreatorId } from '../../../../domain'

const logger = new Logger('SearchStoriesUseCase')

export interface ISearchStoriesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId?: string
  searchCriteria: StorySearchCriteriaDTO
  foundStories(stories: StoryWithRelationsDTO[], totalCount: number): void
}

export type ISearchStoriesUseCase = IUseCase<ISearchStoriesUseCaseOptions>

export class SearchStoriesUseCase implements ISearchStoriesUseCase {
  constructor(private readonly storyLookupService: IStoryLookupService, private readonly userGateway: IUserGateway) {}

  async execute({ loggedInUserId, searchCriteria, foundStories }: ISearchStoriesUseCaseOptions) {
    const loadUserResult = loggedInUserId ? await this.userGateway.getUserById({ userId: loggedInUserId }) : UserLoadResult.notSet()

    const isAnyFilterDefined = this.anyFilterDefined(searchCriteria)

    // TODO split the logic below into potentially more testable parts:
    // StorySearchQueryBuilder & StoryListPaginator or something like that
    // especially if the logic here grows even more complex.

    if (loadUserResult.isSuccess() && _isEmpty(searchCriteria.visibility) && searchCriteria.onlyMyStories === false) {
      // logged in user and no visibility filter defined and not only my stories, show public and logged in stories
      searchCriteria.visibility = [VisibilityEnum.Public, VisibilityEnum.LoggedIn]
    } else if (loadUserResult.isFailed()) {
      // not logged in user, show only public stories
      searchCriteria.visibility = [VisibilityEnum.Public]
    }

    const loggedInUser = loadUserResult.isSuccess() ? loadUserResult.value : undefined

    searchCriteria.loggedInCreatorId = loggedInUser ? new PostCreatorId(loggedInUser.id) : undefined

    let storyList = []
    let totalCount = storyList.length

    if (isAnyFilterDefined) {
      const { stories, storyCount } = await this.searchStoriesWithFilters(searchCriteria)
      storyList = stories
      totalCount = storyCount
    } else {
      const { stories, storyCount } = await this.getAllStories(searchCriteria)
      storyList = stories
      totalCount = storyCount
    }

    const sortedStories = this.sortStories(storyList, searchCriteria.orderBy, searchCriteria.order)
    const paginatedStories = this.paginateStories(sortedStories, searchCriteria.storiesPerPage, searchCriteria.pageNumber)

    foundStories(paginatedStories, totalCount)
  }

  private searchStoriesWithFilters = async (searchCriteria: StorySearchCriteriaDTO) => {
    const storyCount = await this.storyLookupService.count(searchCriteria)
    const stories = await this.storyLookupService.search(searchCriteria)
    return {
      stories,
      storyCount
    }
  }

  private getAllStories = async (
    searchCriteria: StorySearchCriteriaDTO
  ): Promise<{ stories: StoryWithRelationsDTO[]; storyCount: number }> => {
    if (searchCriteria.loggedInCreatorId) {
      const stories = await this.storyLookupService.findAllVisibleForLoggedInCreator(
        searchCriteria.loggedInCreatorId,
        searchCriteria.orderBy,
        searchCriteria.order
      )
      return { stories, storyCount: stories.length }
    } else {
      const stories = await this.storyLookupService.findAllPublic(searchCriteria.orderBy, searchCriteria.order)
      return { stories, storyCount: stories.length }
    }
  }

  private anyFilterDefined(filters: StorySearchCriteriaDTO): boolean {
    if (!filters) {
      return false
    }
    const sanitizedFilters = omitNullAndUndefinedAndEmpty(filters)
    const anyNonMandatoryFilterExists =
      _without(Object.keys(sanitizedFilters), 'storiesPerPage', 'pageNumber', 'onlyMyStories', 'order', 'orderBy').length > 0 ||
      !_isEmpty(sanitizedFilters.visibility)

    return anyNonMandatoryFilterExists || filters.onlyMyStories === true
  }

  // FIXME:
  // currently sorting stories here instead of in the repository
  // because this use case calls multiple different repository methods
  // and I have not bothered to implement storing for them all.
  // Classic case of "Do as I say, not as I do".
  private sortStories = (
    storiesToSort: StoryWithRelationsDTO[],
    orderBy: StorySortableKeyEnum = StorySortableKeyEnum.NAME,
    order: OrderEnum = OrderEnum.Ascending
  ) => {
    return _orderBy(storiesToSort, [orderBy], order)
  }

  private paginateStories = (stories: StoryWithRelationsDTO[], storiesPerPage: number | undefined, pageNumber: number = 0) => {
    if (storiesPerPage && storiesPerPage <= 0) {
      logger.warn('Requested to paginate stories with a negative storiesPerPage value')
      return []
    }

    const startIndex = storiesPerPage ? (pageNumber || 1 - 1) * (storiesPerPage || stories.length) : 0
    const endIndex = storiesPerPage ? startIndex + (storiesPerPage || stories.length) : stories.length

    return stories.slice(startIndex, endIndex)
  }
}
