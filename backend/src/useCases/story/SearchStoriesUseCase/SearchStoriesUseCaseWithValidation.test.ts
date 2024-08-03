import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { SearchStoriesUseCaseWithValidation } from './SearchStoriesUseCaseWithValidation'
import { SearchStoriesUseCase } from './SearchStoriesUseCase'
import { SearchStoriesInputDTO, ISearchStoriesUseCaseOptions, StorySearchCriteria } from '@hatsuportal/post-management'
import { OrderEnum, StorySortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError } from '@hatsuportal/common-bounded-context'

const storiesFound = vi.fn()

interface MockOptions extends ISearchStoriesUseCaseOptions {
  searchStoriesInput: SearchStoriesInputDTO
  foundStories: Mock
}

function createOptions(searchStoriesInput: SearchStoriesInputDTO): MockOptions {
  return { searchStoriesInput, foundStories: storiesFound }
}

describe('SearchStoriesUseCaseWithValidation', () => {
  beforeEach(() => storiesFound.mockReset())

  it('should execute underlying use case when validations pass', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const criteria: StorySearchCriteria = {
      order: OrderEnum.Ascending,
      orderBy: StorySortableKeyEnum.NAME
    } as any

    const options = createOptions({ loggedInUserId: undefined, searchCriteria: criteria })

    const baseUseCase = new SearchStoriesUseCase(storyRepositoryMock, userRepositoryMock, storyMapperMock)
    const useCase = new SearchStoriesUseCaseWithValidation(baseUseCase, userRepositoryMock, authorizationServiceMock)

    // Act
    await useCase.execute(options)

    // Assert
    expect(storiesFound).toHaveBeenCalled()
  })

  it('should throw AuthorizationError when authorization fails', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    authorizationServiceMock.canSearchStories = vi.fn().mockReturnValue({ isAuthorized: false })

    const criteria: StorySearchCriteria = {
      order: OrderEnum.Ascending,
      orderBy: StorySortableKeyEnum.NAME,
      visibility: [VisibilityEnum.Public]
    } as any

    const options = createOptions({ loggedInUserId: undefined, searchCriteria: criteria })

    const baseUseCase = new SearchStoriesUseCase(storyRepositoryMock, userRepositoryMock, unitFixture.storyMapperMock())
    const useCase = new SearchStoriesUseCaseWithValidation(baseUseCase, userRepositoryMock, authorizationServiceMock)

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(AuthorizationError)
    expect(storiesFound).not.toHaveBeenCalled()
  })

  it('should throw InvalidInputError when visibility filter contains invalid value', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const authorizationServiceMock = unitFixture.authorizationServiceMock()

    const invalidVisibility = 'invalid_visibility' as any

    const criteria: StorySearchCriteria = {
      order: OrderEnum.Ascending,
      orderBy: StorySortableKeyEnum.NAME,
      visibility: [invalidVisibility]
    } as any

    const options = createOptions({ loggedInUserId: unitFixture.userDTOMock().id, searchCriteria: criteria })

    const baseUseCase = new SearchStoriesUseCase(storyRepositoryMock, userRepositoryMock, unitFixture.storyMapperMock())
    const useCase = new SearchStoriesUseCaseWithValidation(baseUseCase, userRepositoryMock, authorizationServiceMock)

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(InvalidInputError)
    expect(storiesFound).not.toHaveBeenCalled()
  })
})
