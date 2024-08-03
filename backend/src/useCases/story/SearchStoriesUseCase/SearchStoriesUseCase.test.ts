import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { SearchStoriesUseCase } from './SearchStoriesUseCase'
import { ISearchStoriesUseCaseOptions, SearchStoriesInputDTO, StorySearchCriteria } from '@hatsuportal/post-management'
import { OrderEnum, StorySortableKeyEnum } from '@hatsuportal/common'

const storiesFound = vi.fn()

interface MockUseCaseOptions extends ISearchStoriesUseCaseOptions {
  searchStoriesInput: SearchStoriesInputDTO
  foundStories: Mock
}

function createUseCaseOptions(searchStoriesInput: SearchStoriesInputDTO): MockUseCaseOptions {
  return {
    searchStoriesInput,
    foundStories: storiesFound
  }
}

describe('SearchStoriesUseCase', () => {
  beforeEach(() => {
    storiesFound.mockReset()
  })

  it('should search stories with filters when any filter defined', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const filters: StorySearchCriteria = {
      order: OrderEnum.Ascending,
      orderBy: StorySortableKeyEnum.NAME,
      search: 'test'
    } as any

    const options = createUseCaseOptions({ loggedInUserId: undefined, searchCriteria: filters })

    const useCase = new SearchStoriesUseCase(storyRepositoryMock, userRepositoryMock, storyMapperMock)

    // Act
    await useCase.execute(options)

    // Assert
    expect(storiesFound).toHaveBeenCalledWith(expect.any(Array), expect.any(Number))
  })

  it('should return all public stories when no filters defined and user not logged in', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const criteria: StorySearchCriteria = {
      order: OrderEnum.Descending,
      orderBy: StorySortableKeyEnum.CREATED_AT
    } as any

    const options = createUseCaseOptions({ loggedInUserId: undefined, searchCriteria: criteria })

    const useCase = new SearchStoriesUseCase(storyRepositoryMock, userRepositoryMock, storyMapperMock)

    // Act
    await useCase.execute(options)

    // Assert
    expect(storiesFound).toHaveBeenCalledWith(expect.any(Array), expect.any(Number))
  })

  it('should return stories visible for logged in user when no filters defined', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const userId = unitFixture.userDTOMock().id
    const criteria: StorySearchCriteria = {
      order: OrderEnum.Ascending,
      orderBy: StorySortableKeyEnum.NAME
    } as any

    const options = createUseCaseOptions({ loggedInUserId: userId, searchCriteria: criteria })

    const useCase = new SearchStoriesUseCase(storyRepositoryMock, userRepositoryMock, storyMapperMock)

    // Act
    await useCase.execute(options)

    // Assert
    expect(storiesFound).toHaveBeenCalledWith(expect.any(Array), expect.any(Number))
  })

  it('should propagate unknown errors and not call callback', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const filters: StorySearchCriteria = {
      order: OrderEnum.Ascending,
      orderBy: StorySortableKeyEnum.NAME,
      search: 'error'
    } as any

    storyRepositoryMock.search = vi.fn().mockRejectedValue(new Error('DB failure'))

    const options = createUseCaseOptions({ loggedInUserId: undefined, searchCriteria: filters })

    const useCase = new SearchStoriesUseCase(storyRepositoryMock, userRepositoryMock, storyMapperMock)

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(Error)
    expect(storiesFound).not.toHaveBeenCalled()
  })
})
