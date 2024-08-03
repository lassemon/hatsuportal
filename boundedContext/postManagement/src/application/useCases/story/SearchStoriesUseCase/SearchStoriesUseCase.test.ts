import { describe, it, expect, vi, afterEach } from 'vitest'
import { SearchStoriesScenario } from '../../../../__test__/support/story/SearchStoriesScenario'
import { OrderEnum, StorySortableKeyEnum, DeepPartial } from '@hatsuportal/common'
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
      orderBy: customProps.orderBy ?? StorySortableKeyEnum.NAME,
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

  it('should search stories with filters when any filter defined', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          search: 'test',
          storiesPerPage: 50,
          pageNumber: 0
        })
      )

    scenario.thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('should return all public stories when no filters defined and user not logged in', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withoutLoggedInUser()
      .whenExecutedWithInput(
        baseInput(undefined, {
          order: OrderEnum.Descending,
          orderBy: StorySortableKeyEnum.CREATED_AT,
          storiesPerPage: 50,
          pageNumber: 0
        })
      )

    scenario.thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('should return stories visible for logged in user when no filters defined', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          storiesPerPage: 50,
          pageNumber: 0
        })
      )

    scenario.thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('should not call output boundary when lookup service fails', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .lookupServiceWillReject('search', new unitFixture.TestError('lookup failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          search: 'test',
          storiesPerPage: 50,
          pageNumber: 0
        })
      )

    scenario.thenOutputBoundaryNotCalled('foundStories')
  })
})
