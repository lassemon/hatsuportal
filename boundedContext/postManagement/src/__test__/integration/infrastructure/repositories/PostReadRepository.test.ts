import { beforeEach, describe, expect, it } from 'vitest'
import { EntityTypeEnum, OrderEnum, SortableKeyEnum, VisibilityEnum } from '@hatsuportal/common'
import { PostCreatorId, PostId, PostVisibility } from '../../../../domain'
import { PostReadRepository } from '../../../../infrastructure/repositories/PostReadRepository'
import { PostInfrastructureMapper } from '../../../../infrastructure/mappers/PostInfrastructureMapper'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { persistenceHarness } from '../../../setup.db'
import * as Fixture from '../../../testFactory'

describe('PostReadRepository (integration)', () => {
  let repository: PostReadRepository

  const unitFixture = {
    storyMock: Fixture.storyMock,
    sampleUserId: Fixture.sampleUserId
  }
  const regularUserId = Fixture.sampleUserId
  const otherUserId = Fixture.sampleNonAuthorUserId

  let publicOwnId: string
  let loggedInOtherId: string
  let privateOwnId: string
  let privateOtherId: string

  beforeEach(async () => {
    repository = new PostReadRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new PostInfrastructureMapper()
    )

    const publicOwn = await seedStoryFixture(persistenceHarness, unitFixture, {
      visibility: new PostVisibility(VisibilityEnum.Public),
      createdById: new PostCreatorId(regularUserId)
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

    publicOwnId = publicOwn.story.id.value
    loggedInOtherId = loggedInOther.story.id.value
    privateOwnId = privateOwn.story.id.value
    privateOtherId = privateOther.story.id.value
  })

  const searchIds = (result: { posts: { id: string }[] }) => result.posts.map((post) => post.id)

  const baseCriteria = {
    postType: EntityTypeEnum.Story,
    order: OrderEnum.Descending,
    orderBy: SortableKeyEnum.CREATED_AT,
    postsPerPage: 50,
    pageNumber: 1
  }

  it('anonymous caller sees only public posts', async () => {
    const result = await repository.search({
      ...baseCriteria,
      visibility: [VisibilityEnum.Public],
      isSuperAdmin: false,
      isVisibilityUserProvided: false
    })

    const ids = searchIds(result)
    expect(ids).toContain(publicOwnId)
    expect(ids).not.toContain(loggedInOtherId)
    expect(ids).not.toContain(privateOwnId)
    expect(ids).not.toContain(privateOtherId)
  })

  it('regular logged-in user with server-resolved default sees public, logged_in, and own private posts', async () => {
    const result = await repository.search({
      ...baseCriteria,
      loggedInCreatorId: new PostCreatorId(regularUserId),
      visibility: [VisibilityEnum.Public, VisibilityEnum.LoggedIn],
      isSuperAdmin: false,
      isVisibilityUserProvided: false
    })

    const ids = searchIds(result)
    expect(ids).toContain(publicOwnId)
    expect(ids).toContain(loggedInOtherId)
    expect(ids).toContain(privateOwnId)
    expect(ids).not.toContain(privateOtherId)
  })

  it('super admin with no user-provided filter sees all visibilities from all creators', async () => {
    const result = await repository.search({
      ...baseCriteria,
      loggedInCreatorId: new PostCreatorId(regularUserId),
      isSuperAdmin: true,
      isVisibilityUserProvided: false
    })

    const ids = searchIds(result)
    expect(ids).toContain(publicOwnId)
    expect(ids).toContain(loggedInOtherId)
    expect(ids).toContain(privateOwnId)
    expect(ids).toContain(privateOtherId)
  })

  it('regular user with user-provided private filter sees only own private posts', async () => {
    const result = await repository.search({
      ...baseCriteria,
      loggedInCreatorId: new PostCreatorId(regularUserId),
      visibility: [VisibilityEnum.Private],
      isSuperAdmin: false,
      isVisibilityUserProvided: true
    })

    const ids = searchIds(result)
    expect(ids).toContain(privateOwnId)
    expect(ids).not.toContain(publicOwnId)
    expect(ids).not.toContain(loggedInOtherId)
    expect(ids).not.toContain(privateOtherId)
  })

  it('findById returns a seeded story post', async () => {
    const found = await repository.findById(new PostId(publicOwnId))
    expect(found?.id).toBe(publicOwnId)
  })
})
