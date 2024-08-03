import { describe, expect, it } from 'vitest'
import { OrderEnum, SortableKeyEnum, VisibilityEnum, uuid } from '@hatsuportal/common'
import { PostTitle } from '../../../../../../domain'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { sampleUserId } from '../../../../../testFactory'
import { systemWiring } from '../../../../../setup.system'

describe('SearchStoriesUseCase (system)', () => {
  it('returns seeded story matching search criteria', async ({ unitFixture }) => {
    const uniqueTitle = `System Search Story ${uuid()}`
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, {
      title: new PostTitle(uniqueTitle)
    })
    let foundStories: { id: string }[] = []
    let totalCount = 0

    await systemWiring.createSearchStoriesUseCaseWithValidation().execute({
      loggedInUserId: sampleUserId,
      searchCriteria: {
        order: OrderEnum.Descending,
        orderBy: SortableKeyEnum.CREATED_AT,
        storiesPerPage: 10,
        pageNumber: 0,
        search: uniqueTitle,
        visibility: [VisibilityEnum.Public],
        onlyMyStories: false,
        hasImage: false
      },
      foundStories: (stories, count) => {
        foundStories = stories
        totalCount = count
      }
    })

    expect(totalCount).toBeGreaterThanOrEqual(1)
    expect(foundStories.some((row) => row.id === story.id.value)).toBe(true)
  })
})
