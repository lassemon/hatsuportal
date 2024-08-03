import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, OrderEnum, SortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { seedStoryFixture } from '../../../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../../../setup.db'
import { sampleUserId } from '../../../../../testFactory'
import { systemWiring } from '../../../../../setup.system'

describe('SearchPostsUseCase (system)', () => {
  it('returns seeded story when searching posts by story type', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)
    let foundPosts: { id: string }[] = []
    let totalCount = 0

    await systemWiring.createSearchPostsUseCaseWithValidation().execute({
      loggedInUserId: sampleUserId,
      searchCriteria: {
        order: OrderEnum.Descending,
        orderBy: SortableKeyEnum.CREATED_AT,
        postsPerPage: 10,
        pageNumber: 0,
        search: story.title.value,
        visibility: [VisibilityEnum.Public],
        postType: EntityTypeEnum.Story
      },
      foundPosts: (posts, count) => {
        foundPosts = posts
        totalCount = count
      }
    })

    expect(totalCount).toBeGreaterThanOrEqual(1)
    expect(foundPosts.some((row) => row.id === story.id.value)).toBe(true)
  })

  it('returns seeded story when searching all post types', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)
    let foundPosts: { id: string }[] = []

    await systemWiring.createSearchPostsUseCaseWithValidation().execute({
      loggedInUserId: sampleUserId,
      searchCriteria: {
        order: OrderEnum.Descending,
        orderBy: SortableKeyEnum.CREATED_AT,
        postsPerPage: 10,
        pageNumber: 0,
        search: story.title.value,
        visibility: [VisibilityEnum.Public]
      },
      foundPosts: (posts) => {
        foundPosts = posts
      }
    })

    expect(foundPosts.some((row) => row.id === story.id.value)).toBe(true)
  })
})
