import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { FindStoryUseCase } from './FindStoryUseCase'
import { IFindStoryUseCaseOptions, FindStoryInputDTO } from '@hatsuportal/post-management'
import { NotFoundError } from '@hatsuportal/common-bounded-context'

const storyFound = vi.fn()

interface MockUseCaseOptions extends IFindStoryUseCaseOptions {
  findStoryInput: FindStoryInputDTO
  storyFound: Mock
}

function createUseCaseOptions(findStoryInput: FindStoryInputDTO): MockUseCaseOptions {
  return { findStoryInput, storyFound }
}

describe('FindStoryUseCase', () => {
  beforeEach(() => {
    storyFound.mockReset()
  })

  it('should find a story and invoke callback', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    const storyMapperMock = unitFixture.storyMapperMock()

    const story = unitFixture.storyMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(story)

    const options = createUseCaseOptions({ storyIdToFind: story.id.value, loggedInUserId: undefined })
    const useCase = new FindStoryUseCase(storyRepositoryMock, storyMapperMock)

    // Act
    await useCase.execute(options)

    // Assert
    expect(options.storyFound).toHaveBeenCalled()
  })

  it('should throw NotFoundError when story is not found', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    storyRepositoryMock.findById = vi.fn().mockResolvedValue(null)

    const useCase = new FindStoryUseCase(storyRepositoryMock, unitFixture.storyMapperMock())
    const options = createUseCaseOptions({ storyIdToFind: 'non-existent-story-a2f0-f95ccab82d92', loggedInUserId: undefined })

    // Act & Assert
    await expect(useCase.execute(options)).rejects.toThrow(NotFoundError)
    expect(options.storyFound).not.toHaveBeenCalled()
  })

  it('should propagate repository errors', async ({ unitFixture }) => {
    // Arrange
    const storyRepositoryMock = unitFixture.storyRepositoryMock()
    storyRepositoryMock.findById = vi.fn().mockRejectedValue(new Error('DB'))

    const useCase = new FindStoryUseCase(storyRepositoryMock, unitFixture.storyMapperMock())
    const options = createUseCaseOptions({ storyIdToFind: 'id', loggedInUserId: undefined })

    // Act & Assert
    await unitFixture.expectErrorWraps(useCase.execute(options), Error, Error)
  })
})
