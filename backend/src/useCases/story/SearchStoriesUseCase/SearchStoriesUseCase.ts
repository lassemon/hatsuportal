import {
  IStoryApplicationMapper,
  ISearchStoriesUseCase,
  ISearchStoriesUseCaseOptions,
  IStoryRepository,
  Story,
  StorySearchCriteria,
  PostCreatorId
} from '@hatsuportal/post-management'
import { IUserRepository, UserId as UserIdFromUserManagement } from '@hatsuportal/user-management'
import { Logger, OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { ApplicationError } from '@hatsuportal/common-bounded-context'
import _ from 'lodash'

const logger = new Logger('SearchStoriesUseCase')

export class SearchStoriesUseCase implements ISearchStoriesUseCase {
  constructor(
    private readonly storyRepository: IStoryRepository,
    private readonly userRepository: IUserRepository,
    private readonly storyMapper: IStoryApplicationMapper
  ) {}

  async execute({ searchStoriesInput, foundStories }: ISearchStoriesUseCaseOptions) {
    try {
      const { loggedInUserId, searchCriteria } = searchStoriesInput
      const loggedInUser = loggedInUserId ? await this.userRepository.findById(new UserIdFromUserManagement(loggedInUserId)) : null

      const isAnyFilterDefined = this.anyFilterDefined(searchCriteria)

      if (loggedInUser && _.isEmpty(searchCriteria.visibility) && searchCriteria.onlyMyStories === false) {
        // logged in user and no visibility filter defined and not only my stories, show public and logged in stories
        searchCriteria.visibility = [VisibilityEnum.Public, VisibilityEnum.LoggedIn]
      } else if (!loggedInUser) {
        // not logged in user, show only public stories
        searchCriteria.visibility = [VisibilityEnum.Public]
      }

      searchCriteria.loggedInCreatorId = loggedInUser ? new PostCreatorId(loggedInUser.id.toString()) : undefined

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
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }

  private searchStoriesWithFilters = async (searchCriteria: StorySearchCriteria) => {
    const storyCount = await this.storyRepository.count(searchCriteria)
    const stories = await this.storyRepository.search(searchCriteria)
    return {
      stories,
      storyCount
    }
  }

  private getAllStories = async (searchCriteria: StorySearchCriteria): Promise<{ stories: Story[]; storyCount: number }> => {
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

  private anyFilterDefined(filters: StorySearchCriteria): boolean {
    if (!filters) {
      return false
    }
    const anyNonMandatoryFilterExists =
      _.without(Object.keys(filters), 'storiesPerPage', 'pageNumber', 'onlyMyStories', 'order', 'orderBy').length > 0 &&
      !_.isEmpty(filters.visibility)
    return anyNonMandatoryFilterExists || filters.onlyMyStories === true
  }

  private sortStories = (
    storiesToSort: Story[],
    orderBy: StorySortableKeyEnum = StorySortableKeyEnum.NAME,
    order: OrderEnum = OrderEnum.Ascending
  ) => {
    return _.orderBy(storiesToSort, [orderBy], order)
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
