import { describe, it, expect, vi, afterEach } from 'vitest'
import { NotFoundError } from '@hatsuportal/common-bounded-context'
import { FindStoryScenario } from '../../../../__test__/support/story/FindStoryScenario'

describe('FindStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should find a story and invoke output boundary', async ({ unitFixture }) => {
    const scenario = await FindStoryScenario.given().withLoggedInUser().withExistingStory().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdToFind: unitFixture.storyDTOMock().id
    })

    scenario.thenOutputBoundaryCalled('storyFound', expect.any(Object))
  })

  it('should throw NotFoundError when story is not found', async ({ unitFixture }) => {
    const scenario = await FindStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToFind: 'non-existent-story-a2f0-f95ccab82d92'
      })

    scenario.thenOutputBoundaryNotCalled('storyFound')
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await FindStoryScenario.given()
      .withLoggedInUser()
      .repositoryWillReject('findById', new unitFixture.TestError('DB'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToFind: 'dummy-story-id-a2f0-f95ccab82d92-1234578'
      })

    scenario.thenOutputBoundaryNotCalled('storyFound')
  })
})
