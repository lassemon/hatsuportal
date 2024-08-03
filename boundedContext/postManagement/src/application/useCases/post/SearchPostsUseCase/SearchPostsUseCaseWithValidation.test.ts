import { describe, it, vi, afterEach } from 'vitest'
import { SearchPostsValidationScenario } from '../../../../__test__/support/post/SearchPostsValidationScenario'
import { EntityTypeEnum, OrderEnum, SortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
import { ISearchPostsUseCaseOptions } from './SearchPostsUseCase'
import { PostSearchCriteriaDTO } from '../../../dtos'
import { DeepPartial } from '@hatsuportal/common'

describe('SearchPostsUseCaseWithValidation', () => {
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

  it('should execute underlying use case when validations pass for story post type', async ({ unitFixture }) => {
    const scenario = await SearchPostsValidationScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          postType: EntityTypeEnum.Story
        })
      )

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization fails', async ({ unitFixture }) => {
    const scenario = await SearchPostsValidationScenario.given()
      .withLoggedInUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          postType: EntityTypeEnum.Story
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('denies anonymous story search with visibility filter via real ABAC', async () => {
    const scenario = await SearchPostsValidationScenario.given()
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(
        baseInput(undefined, {
          postType: EntityTypeEnum.Story,
          visibility: [VisibilityEnum.Public]
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('throws AuthorizationError when supplied user id fails to load for story search', async ({ unitFixture }) => {
    const unknownUserId = 'unknown-user-a2f0-f95ccab82d92'
    const scenario = await SearchPostsValidationScenario.given()
      .withFailedUserLoad(unknownUserId)
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(
        baseInput(unknownUserId, {
          postType: EntityTypeEnum.Story
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('skips story authorization for non-story post type search', async () => {
    const scenario = await SearchPostsValidationScenario.given()
      .whenExecutedWithInput(
        baseInput(undefined, {
          postType: EntityTypeEnum.Recipe
        })
      )

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when postsPerPage is negative', async ({ unitFixture }) => {
    const scenario = await SearchPostsValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          postsPerPage: -1
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
