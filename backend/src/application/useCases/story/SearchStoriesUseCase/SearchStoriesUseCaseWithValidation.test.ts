import { describe, it, vi, afterEach } from 'vitest'
import { OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError } from '@hatsuportal/common-bounded-context'
import { SearchStoriesValidationScenario } from '../../../../__test__/support/story/SearchStoriesValidationScenario'

describe('SearchStoriesUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
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

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization fails', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withoutLoggedInUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput({
        loggedInUserId: undefined,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when visibility filter contains invalid value', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          visibility: ['invalid_visibility' as VisibilityEnum],
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when visibility filter contains mixed valid and invalid values', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          visibility: [VisibilityEnum.Public, 'invalid_visibility' as VisibilityEnum, VisibilityEnum.Private],
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when order filter contains invalid value', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: 'invalid_order' as OrderEnum,
          orderBy: StorySortableKeyEnum.NAME,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when orderBy filter contains invalid value', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: 'invalid_order_by' as StorySortableKeyEnum,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when onlyMyStories is not a boolean', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          onlyMyStories: 'true' as unknown as boolean,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when hasImage is not a boolean', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          hasImage: 'yes' as unknown as boolean,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when search is not a string', async ({ unitFixture }) => {
    const scenario = await SearchStoriesValidationScenario.given()
      .withLoggedInUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        searchCriteria: {
          order: OrderEnum.Ascending,
          orderBy: StorySortableKeyEnum.NAME,
          search: 123 as unknown as string,
          storiesPerPage: 50,
          pageNumber: 0
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
