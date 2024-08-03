import { describe, it, expect, vi, afterEach } from 'vitest'
import { FindStoryScenario } from '../../../../__test__/support/story/FindStoryScenario'
import { NotFoundError } from '@hatsuportal/platform'

describe('FindStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should find a story and invoke output boundary', async ({ unitFixture }) => {
    const scenario = await FindStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.sampleUserId,
        findStoryInput: {
          storyIdToFind: unitFixture.storyDTOMock().id
        },
        storyFound: vi.fn()
      })

    scenario.thenOutputBoundaryCalled('storyFound', expect.any(Object))
  })

  it('should throw NotFoundError when story is not found', async ({ unitFixture }) => {
    const scenario = await FindStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStoryInLookupService()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.sampleUserId,
        findStoryInput: {
          storyIdToFind: 'non-existent-story-a2f0-f95ccab82d92'
        },
        storyFound: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyFound')
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await FindStoryScenario.given()
      .withLoggedInUser()
      .lookupServiceWillReject('findById', new unitFixture.TestError('DB'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.sampleUserId,
        findStoryInput: {
          storyIdToFind: 'dummy-story-id-a2f0-f95ccab82d92-1234578'
        },
        storyFound: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyFound')
  })
})
