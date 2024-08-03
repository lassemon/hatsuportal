import { describe, it, expect, vi, afterEach } from 'vitest'
import { OrderEnum, StorySortableKeyEnum } from '@hatsuportal/common'
import { SearchStoriesScenario } from '../../../../__test__/support/story/SearchStoriesScenario'

describe('SearchStoriesUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should search stories with filters when any filter defined', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          search: 'test',
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('should return all public stories when no filters defined and user not logged in', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withoutLoggedInUser()
      .whenExecutedWithInput({
        loggedInUserId: undefined,
        searchCriteria: {
          order: OrderEnum.Descending,
          orderBy: StorySortableKeyEnum.CREATED_AT,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('should return stories visible for logged in user when no filters defined', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenOutputBoundaryCalled('foundStories', expect.any(Array), expect.any(Number))
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await SearchStoriesScenario.given()
      .withLoggedInUser()
      .repositoryWillReject('search', new unitFixture.TestError('DB failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          search: 'test',
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenOutputBoundaryNotCalled('foundStories')
  })
})
