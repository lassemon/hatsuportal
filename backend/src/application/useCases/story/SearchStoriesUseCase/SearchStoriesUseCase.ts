import {
  IStoryApplicationMapper,
  ISearchStoriesUseCase,
  ISearchStoriesUseCaseOptions,
  IStoryRepository,
  Story,
  PostCreatorId,
  StorySearchCriteriaDTO
} from '@hatsuportal/post-management'
import { IUserRepository, UserId } from '@hatsuportal/user-management'
import { Logger, omitNullAndUndefinedAndEmpty, OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import _isEmpty from 'lodash/isEmpty'
import _without from 'lodash/without'
import _orderBy from 'lodash/orderBy'

const logger = new Logger('SearchStoriesUseCase')

export class SearchStoriesUseCase implements ISearchStoriesUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly userRepository: IUserRepository,
    private readonly storyMapper: IStoryApplicationMapper
  ) {}

  async execute({ searchStoriesInput, foundStories }: ISearchStoriesUseCaseOptions) {
    const { loggedInUserId, searchCriteria } = searchStoriesInput
    const loggedInUser = loggedInUserId ? await this.userRepository.findById(new UserId(loggedInUserId)) : null

    const isAnyFilterDefined = this.anyFilterDefined(searchCriteria)

    // TODO split the logic into potentially more testable parts:
    // StorySearchQueryBuilder & StoryListPaginator or something like that
    // especially if the logic here grows even more complex.

    if (loggedInUser && _isEmpty(searchCriteria.visibility) && searchCriteria.onlyMyStories === false) {
      // logged in user and no visibility filter defined and not only my stories, show public and logged in stories
      searchCriteria.visibility = [VisibilityEnum.Public, VisibilityEnum.LoggedIn]
    } else if (!loggedInUser) {
      // not logged in user, show only public stories
      searchCriteria.visibility = [VisibilityEnum.Public]
    }

    searchCriteria.loggedInCreatorId = loggedInUser ? new PostCreatorId(loggedInUser.id.value) : undefined

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

    foundStories(
      paginatedStories.map((story) => this.storyMapper.toDTO(story)),
      totalCount
    )
  }

  private searchStoriesWithFilters = async (searchCriteria: StorySearchCriteriaDTO) => {
    const storyCount = await this.storyRepository.count(searchCriteria)
    const stories = await this.storyRepository.search(searchCriteria)
    return {
      stories,
      storyCount
    }
  }

  private getAllStories = async (searchCriteria: StorySearchCriteriaDTO): Promise<{ stories: Story[]; storyCount: number }> => {
    if (searchCriteria.loggedInCreatorId) {
      const stories = await this.storyRepository.findAllVisibleForLoggedInCreator(
        searchCriteria.loggedInCreatorId,
        searchCriteria.orderBy,
        searchCriteria.order
      )
      return { stories, storyCount: stories.length }
    } else {
      const stories = await this.storyRepository.findAllPublic(searchCriteria.orderBy, searchCriteria.order)
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
    storiesToSort: Story[],
    orderBy: StorySortableKeyEnum = StorySortableKeyEnum.NAME,
    order: OrderEnum = OrderEnum.Ascending
  ) => {
    return _orderBy(storiesToSort, [orderBy], order)
  }

  private paginateStories = (stories: Story[], storiesPerPage: number | undefined, pageNumber: number = 0) => {
    if (storiesPerPage && storiesPerPage <= 0) {
      logger.warn('Requested to paginate stories with a negative storiesPerPage value')
      return []
    }

    const startIndex = storiesPerPage ? (pageNumber || 1 - 1) * (storiesPerPage || stories.length) : 0
    const endIndex = storiesPerPage ? startIndex + (storiesPerPage || stories.length) : stories.length

    return stories.slice(startIndex, endIndex)
  }
}
