import { describe, it, vi, afterEach } from 'vitest'
import { SearchStoriesValidationScenario } from '../../../../__test__/support/story/SearchStoriesValidationScenario'
import { OrderEnum, StorySortableKeyEnum, VisibilityEnum, DeepPartial } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError } from '@hatsuportal/platform'
import { ISearchStoriesUseCaseOptions } from './SearchStoriesUseCase'
import { StorySearchCriteriaDTO } from '../../../dtos'

describe('SearchStoriesUseCaseWithValidation', () => {
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

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization fails', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when visibility filter contains invalid value', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          visibility: ['invalid_visibility' as VisibilityEnum]
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when visibility filter contains mixed valid and invalid values', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          visibility: [VisibilityEnum.Public, 'invalid_visibility' as VisibilityEnum, VisibilityEnum.Private]
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when order filter contains invalid value', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          order: 'invalid_order' as OrderEnum
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when orderBy filter contains invalid value', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          orderBy: 'invalid_order_by' as StorySortableKeyEnum
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when onlyMyStories is not a boolean', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          onlyMyStories: 'true' as unknown as boolean
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when hasImage is not a boolean', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          hasImage: 'yes' as unknown as boolean
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when search is not a string', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(
        baseInput(unitFixture.sampleUserId, {
          search: 123 as unknown as string
        })
      )

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
