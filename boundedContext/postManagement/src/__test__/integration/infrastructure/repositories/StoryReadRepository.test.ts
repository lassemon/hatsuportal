import { beforeAll, describe, expect, it } from 'vitest'
import { OrderEnum, SortableKeyEnum, VisibilityEnum, uuid } from '@hatsuportal/common'
import { CoverImageId, PostCreatorId, PostId, PostVisibility } from '../../../../domain'
import { StoryReadRepository } from '../../../../infrastructure/repositories/StoryReadRepository'
import { StoryInfrastructureMapper } from '../../../../infrastructure/mappers/StoryInfrastructureMapper'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { insertImagesForeignKeyStub } from '../../../support/fkStubs/images'
import { insertUsersForeignKeyStub } from '../../../support/fkStubs/users'
import { persistenceHarness } from '../../../setup.db'
import * as Fixture from '../../../testFactory'

describe('StoryReadRepository (integration)', () => {
  let repository: StoryReadRepository

  const unitFixture = {
    storyMock: Fixture.storyMock,
    sampleUserId: Fixture.sampleUserId
  }
  const regularUserId = Fixture.sampleUserId
  const otherUserId = Fixture.sampleNonAuthorUserId

  beforeAll(async () => {
    repository = new StoryReadRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new StoryInfrastructureMapper()
    )
    await insertUsersForeignKeyStub(persistenceHarness, {
      id: otherUserId,
      email: 'other-user-fk-stub@hatsuportal.test',
      name: 'other-user-fk-stub'
    })
  })

  it('findById returns seeded story read model', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)

    const found = await repository.findById(story.id)
    expect(found?.id).toBe(story.id.value)
    expect(found?.title).toBe(story.title.value)
  })

  it('search and countStoriesByCreator return seeded story', async ({ unitFixture }) => {
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture)

    const results = await repository.search({
      loggedInCreatorId: story.createdById,
      visibility: [VisibilityEnum.Public],
      onlyMyStories: false,
      search: story.title.value,
      orderBy: SortableKeyEnum.CREATED_AT,
      order: OrderEnum.Descending,
      pageNumber: 0,
      storiesPerPage: 10,
      hasImage: false
    })
    const count = await repository.countStoriesByCreator(new PostCreatorId(story.createdById.value))

    expect(results.some((row) => row.id === story.id.value)).toBe(true)
    expect(count).toBeGreaterThanOrEqual(1)
  })

  it('findByImageId returns stories referencing a cover image', async () => {
    const coverImageId = new CoverImageId(uuid())
    const otherImageId = new CoverImageId(uuid())

    await insertImagesForeignKeyStub(persistenceHarness, {
      id: coverImageId.value,
      createdById: regularUserId
    })
    await insertImagesForeignKeyStub(persistenceHarness, {
      id: otherImageId.value,
      createdById: regularUserId
    })

    const { story: matchingStory } = await seedStoryFixture(persistenceHarness, unitFixture, {
      coverImageId
    })
    await seedStoryFixture(persistenceHarness, unitFixture, {
      coverImageId: otherImageId
    })

    const found = await repository.findByImageId(new PostId(coverImageId.value))

    expect(found.map((row) => row.id)).toEqual([matchingStory.id.value])
  })

  it('findAllReferencedCoverImageIds returns distinct cover image ids', async () => {
    const firstImageId = new CoverImageId(uuid())
    const secondImageId = new CoverImageId(uuid())

    await insertImagesForeignKeyStub(persistenceHarness, {
      id: firstImageId.value,
      createdById: regularUserId
    })
    await insertImagesForeignKeyStub(persistenceHarness, {
      id: secondImageId.value,
      createdById: regularUserId
    })

    await seedStoryFixture(persistenceHarness, unitFixture, { coverImageId: firstImageId })
    await seedStoryFixture(persistenceHarness, unitFixture, { coverImageId: secondImageId })
    await seedStoryFixture(persistenceHarness, unitFixture, { coverImageId: CoverImageId.NOT_SET })

    const referencedIds = await repository.findAllReferencedCoverImageIds()

    expect(referencedIds.sort()).toEqual([firstImageId.value, secondImageId.value].sort())
  })

  it('findAllPublic returns only public stories', async () => {
    const publicStory = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.Public),
      createdById: new PostCreatorId(regularUserId)
    })
    const loggedInStory = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.LoggedIn),
      createdById: new PostCreatorId(otherUserId)
    })
    const privateStory = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.Private),
      createdById: new PostCreatorId(regularUserId)
    })

    const results = await repository.findAllPublic(SortableKeyEnum.CREATED_AT, OrderEnum.Ascending)
    const ids = results.map((row) => row.id)

    expect(ids).toContain(publicStory.story.id.value)
    expect(ids).not.toContain(loggedInStory.story.id.value)
    expect(ids).not.toContain(privateStory.story.id.value)
  })

  it('findAllVisibleForLoggedInCreator includes public, logged_in, and own private stories', async () => {
    const publicOther = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.Public),
      createdById: new PostCreatorId(otherUserId)
    })
    const loggedInOther = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.LoggedIn),
      createdById: new PostCreatorId(otherUserId)
    })
    const privateOwn = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.Private),
      createdById: new PostCreatorId(regularUserId)
    })
    const privateOther = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.Private),
      createdById: new PostCreatorId(otherUserId)
    })

    const results = await repository.findAllVisibleForLoggedInCreator(
      new PostCreatorId(regularUserId),
      SortableKeyEnum.CREATED_AT,
      OrderEnum.Ascending
    )
    const ids = results.map((row) => row.id)

    expect(ids).toContain(publicOther.story.id.value)
    expect(ids).toContain(loggedInOther.story.id.value)
    expect(ids).toContain(privateOwn.story.id.value)
    expect(ids).not.toContain(privateOther.story.id.value)
  })
})
