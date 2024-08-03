import { describe, it, expect, vi, afterEach } from 'vitest'
import { SearchPostsScenario } from '../../../../__test__/support/post/SearchPostsScenario'
import { OrderEnum, SortableKeyEnum, DeepPartial, EntityTypeEnum, UserRoleEnum } from '@hatsuportal/common'
import { ISearchPostsUseCaseOptions } from './SearchPostsUseCase'
import { PostSearchCriteriaDTO } from '../../../dtos'

describe('SearchPostsUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId?: string, customProps: DeepPartial<PostSearchCriteriaDTO> = {}): ISearchPostsUseCaseOptions => ({
    loggedInUserId: userId,
    searchCriteria: {
      order: customProps.order ?? OrderEnum.Ascending,
      orderBy: customProps.orderBy ?? SortableKeyEnum.TITLE,
      postsPerPage: customProps.postsPerPage ?? 50,
      pageNumber: customProps.pageNumber ?? 0,
      loggedInCreatorId: typeof customProps.loggedInCreatorId === 'undefined' ? customProps.loggedInCreatorId : undefined,
      search: customProps.search ?? undefined,
      visibility:
        typeof customProps.visibility !== 'undefined' ? customProps.visibility.filter((visibility) => visibility !== undefined) : undefined,
      postType: customProps.postType
    },
    foundPosts: vi.fn()
  })

  describe('type-specific search (postType = story)', () => {
    it('delegates to StoryListSearchService and maps results to PostWithRelationsDTO', async ({ unitFixture }) => {
      const scenario = await SearchPostsScenario.given()
        .withLoggedInUser()
        .whenExecutedWithInput(
          baseInput(unitFixture.sampleUserId, {
            postType: EntityTypeEnum.Story,
            search: 'test',
            postsPerPage: 50,
            pageNumber: 0
          })
        )

      scenario
        .thenStoryListSearchServiceCalledTimes('search', 1)
        .thenPostReadRepositoryCalledTimes('search', 0)
        .thenOutputBoundaryCalled('foundPosts', expect.any(Array), expect.any(Number))
    })

    it('should not call output boundary when StoryListSearchService fails', async ({ unitFixture }) => {
      const scenario = await SearchPostsScenario.given()
        .withLoggedInUser()
        .lookupServiceWillReject('search', new unitFixture.TestError('lookup failure'))
        .expectErrorOfType(unitFixture.TestError)
        .whenExecutedWithInput(
          baseInput(unitFixture.sampleUserId, {
            postType: EntityTypeEnum.Story,
            search: 'test',
            postsPerPage: 50,
            pageNumber: 0
          })
        )

      scenario.thenOutputBoundaryNotCalled('foundPosts')
    })
  })

  describe('cross-type search (postType = undefined / "All")', () => {
    it('queries PostReadRepository and hydrates story results via StoryLookupService', async ({ unitFixture }) => {
      const scenario = await SearchPostsScenario.given()
        .withLoggedInUser()
        .whenExecutedWithInput(
          baseInput(unitFixture.sampleUserId, {
            order: OrderEnum.Ascending,
            orderBy: SortableKeyEnum.TITLE,
            postsPerPage: 50,
            pageNumber: 0
          })
        )

      scenario
        .thenPostReadRepositoryCalledTimes('search', 1)
        .thenStoryListSearchServiceCalledTimes('search', 0)
        .thenOutputBoundaryCalled('foundPosts', expect.any(Array), expect.any(Number))
    })

    it('returns empty result when PostReadRepository finds no posts', async ({ unitFixture }) => {
      const scenario = await SearchPostsScenario.given()
        .withLoggedInUser()
        .postReadRepositoryWillReturn([], 0)
        .whenExecutedWithInput(
          baseInput(unitFixture.sampleUserId, {
            order: OrderEnum.Ascending,
            orderBy: SortableKeyEnum.TITLE,
            postsPerPage: 50,
            pageNumber: 0
          })
        )

      scenario
        .thenStoryLookupServiceCalledTimes('findByIds', 0)
        .thenOutputBoundaryCalled('foundPosts', [], 0)
    })

    it('applies public-only visibility for anonymous user', async () => {
      const scenario = await SearchPostsScenario.given()
        .withoutLoggedInUser()
        .whenExecutedWithInput(
          baseInput(undefined, {
            order: OrderEnum.Descending,
            orderBy: SortableKeyEnum.CREATED_AT,
            postsPerPage: 50,
            pageNumber: 0
          })
        )

      scenario
        .thenPostReadRepositoryCalledTimes('search', 1)
        .thenOutputBoundaryCalled('foundPosts', expect.any(Array), expect.any(Number))
    })

    it('applies all-visibility for superadmin', async ({ unitFixture }) => {
      const superadminUser = unitFixture.userReadModelDTOMock({ roles: [UserRoleEnum.SuperAdmin] })
      const scenario = await SearchPostsScenario.given()
        .withLoggedInUser(superadminUser)
        .whenExecutedWithInput(
          baseInput(unitFixture.sampleUserId, {
            order: OrderEnum.Ascending,
            orderBy: SortableKeyEnum.TITLE,
            postsPerPage: 50,
            pageNumber: 0
          })
        )

      scenario
        .thenPostReadRepositoryCalledTimes('search', 1)
        .thenOutputBoundaryCalled('foundPosts', expect.any(Array), expect.any(Number))
    })
  })
})
