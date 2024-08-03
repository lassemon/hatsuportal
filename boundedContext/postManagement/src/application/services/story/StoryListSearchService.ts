import { isEmpty as _isEmpty, orderBy as _orderBy, without as _without } from 'lodash'
import { Logger, omitNullAndUndefinedAndEmpty, OrderEnum, SortableKeyEnum, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { StorySearchCriteriaDTO, StoryWithRelationsDTO } from '../../dtos'
import { IStoryLookupService } from './StoryLookupService'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { UserLoadResult } from '../../acl/userManagement/outcomes/UserLoadResult'
import { PostCreatorId } from '../../../domain'
import { UserReadModelDTO } from '../../dtos/user/UserReadModelDTO'

const logger = new Logger('StoryListSearchService')

export interface StoryListSearchParams {
  loggedInUserId?: string
  searchCriteria: StorySearchCriteriaDTO
}

export interface IStoryListSearchService {
  search(params: StoryListSearchParams): Promise<{ stories: StoryWithRelationsDTO[]; totalCount: number }>
}

export class StoryListSearchService implements IStoryListSearchService {
  constructor(
    private readonly storyLookupService: IStoryLookupService,
    private readonly userGateway: IUserGateway
  ) {}

  async search({ loggedInUserId, searchCriteria }: StoryListSearchParams): Promise<{
    stories: StoryWithRelationsDTO[]
    totalCount: number
  }> {
    const loadUserResult = loggedInUserId ? await this.userGateway.getUserById({ userId: loggedInUserId }) : UserLoadResult.notSet()

    const isAnyFilterDefined = this.anyFilterDefined(searchCriteria)

    if (loadUserResult.isSuccess() && _isEmpty(searchCriteria.visibility) && searchCriteria.onlyMyStories === false) {
      searchCriteria.visibility = [VisibilityEnum.Public, VisibilityEnum.LoggedIn]
    } else if (!loadUserResult.isSuccess()) {
      // covers both notSet() (anonymous user) and failedToLoad() (unrecognised userId)
      searchCriteria.visibility = [VisibilityEnum.Public]
    }

    const loggedInUser = loadUserResult.isSuccess() ? loadUserResult.value : undefined

    searchCriteria.loggedInCreatorId = loggedInUser ? new PostCreatorId(loggedInUser.id) : undefined

    let storyList: StoryWithRelationsDTO[] = []
    let totalCount = storyList.length

    if (isAnyFilterDefined) {
      const { stories, storyCount } = await this.searchStoriesWithFilters(searchCriteria)
      storyList = stories
      totalCount = storyCount
    } else {
      const { stories, storyCount } = await this.getAllStories(searchCriteria, loggedInUser)
      storyList = stories
      totalCount = storyCount
    }

    const sortedStories = this.sortStories(storyList, searchCriteria.orderBy, searchCriteria.order)
    const paginatedStories = this.paginateStories(sortedStories, searchCriteria.storiesPerPage, searchCriteria.pageNumber)

    return { stories: paginatedStories, totalCount }
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
    searchCriteria: StorySearchCriteriaDTO,
    loggedInUser?: UserReadModelDTO
  ): Promise<{ stories: StoryWithRelationsDTO[]; storyCount: number }> => {
    if (searchCriteria.loggedInCreatorId) {
      if (loggedInUser?.roles.includes(UserRoleEnum.SuperAdmin)) {
        const stories = await this.storyLookupService.findAll(searchCriteria.orderBy, searchCriteria.order)
        return { stories, storyCount: stories.length }
      } else {
        const stories = await this.storyLookupService.findAllVisibleForLoggedInCreator(
          searchCriteria.loggedInCreatorId,
          searchCriteria.orderBy,
          searchCriteria.order
        )
        return { stories, storyCount: stories.length }
      }
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

  private sortStories = (
    storiesToSort: StoryWithRelationsDTO[],
    orderBy: SortableKeyEnum = SortableKeyEnum.TITLE,
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
