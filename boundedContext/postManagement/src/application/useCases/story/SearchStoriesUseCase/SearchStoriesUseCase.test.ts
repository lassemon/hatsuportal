import { describe, it, expect, vi, afterEach } from 'vitest'
import { SearchStoriesScenario } from '../../../../__test__/support/story/SearchStoriesScenario'
import { OrderEnum, SortableKeyEnum, DeepPartial } from '@hatsuportal/common'
import { ISearchStoriesUseCaseOptions } from './SearchStoriesUseCase'
import { StorySearchCriteriaDTO } from '../../../dtos'

describe('SearchStoriesUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId?: string, customProps: DeepPartial<StorySearchCriteriaDTO> = {}): ISearchStoriesUseCaseOptions => ({
    loggedInUserId: userId,
    searchCriteria: {
      order: customProps.order ?? OrderEnum.Ascending,
      orderBy: customProps.orderBy ?? SortableKeyEnum.TITLE,
      storiesPerPage: customProps.storiesPerPage ?? 50,
      pageNumber: customProps.pageNumber ?? 0,
      loggedInCreatorId: typeof customProps.loggedInCreatorId === 'undefined' ? customProps.loggedInCreatorId : undefined,
      onlyMyStories: customProps.onlyMyStories ?? undefined,
      search: customProps.search ?? undefined,
      visibility:
        typeof customProps.visibility !== 'undefined' ? customProps.visibility.filter((visibility) => visibility !== undefined) : undefined,
      hasImage: customProps.hasImage ?? undefined
    },
    foundStories: vi.fn()
  })

  it('delegates to StoryListSearchService and calls foundStories with the results', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          order: OrderEnum.Ascending,
          orderBy: SortableKeyEnum.TITLE,
          search: 'test',
          storiesPerPage: 50,
          pageNumber: 0
        })
      )

    scenario
      .thenStoryListSearchServiceCalledTimes('search', 1)
      .thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('calls foundStories even when no userId is provided', async () => {
    const scenario = await SearchStoriesScenario.given()
      .whenExecutedWithInput(
        baseInput(undefined, {
          order: OrderEnum.Descending,
          orderBy: SortableKeyEnum.CREATED_AT,
          storiesPerPage: 50,
          pageNumber: 0
        })
      )

    scenario
      .thenStoryListSearchServiceCalledTimes('search', 1)
      .thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('does not call output boundary when StoryListSearchService fails', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .listSearchServiceWillReject(new unitFixture.TestError('lookup failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          order: OrderEnum.Ascending,
          orderBy: SortableKeyEnum.TITLE,
          search: 'test',
          storiesPerPage: 50,
          pageNumber: 0
        })
      )

    scenario.thenOutputBoundaryNotCalled('foundStories')
  })
})
