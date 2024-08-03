import { describe, expect, it } from 'vitest'
import { uuid, unixtimeNow, VisibilityEnum, UserRoleEnum } from '@hatsuportal/common'
import { CommentAuthorId, CommentId, PostId } from '@hatsuportal/post-management'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { createCommentWriteRepository, seedCommentFixture } from '../../../support/fixtures/commentFixture'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'
import request from 'supertest'

async function seedCreatorUser() {
  return seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Creator] })
}

describe('PostController (system)', () => {
  it('returns top-level comments shape from GET /api/v1/posts/{id}/comments', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { comment, storyId } = await seedCommentFixture(persistenceHarness, unitFixture, {
      authorId: loginUser.userId,
      createdById: loginUser.userId
    })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get(`/api/v1/posts/${storyId}/comments`).query({ limit: 10 })

    expect(response.status).toBe(200)
    expect(response.body.comments.some((row: { id: string }) => row.id === comment.id.value)).toBe(true)
    expect(response.body).toEqual(
      expect.objectContaining({
        comments: expect.any(Array),
        nextCursor: null
      })
    )
  })

  it('paginates top-level comments with nextCursor via GET /api/v1/posts/{id}/comments', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: loginUser.userId })
    const storyId = story.id.value
    const commentWriteRepository = createCommentWriteRepository(persistenceHarness)
    const baseCreatedAt = unixtimeNow() - 10_000
    const seededIds: string[] = []

    for (let index = 0; index < 3; index++) {
      const createdAt = baseCreatedAt + index * 1_000
      const comment = unitFixture.commentMock({
        id: new CommentId(uuid()),
        postId: new PostId(storyId),
        authorId: new CommentAuthorId(loginUser.userId),
        createdAt: new CreatedAtTimestamp(createdAt),
        updatedAt: new UnixTimestamp(createdAt)
      })
      await persistenceHarness.createUnitOfWork().execute(async () => {
        await commentWriteRepository.insert(comment)
        return [null]
      })
      seededIds.push(comment.id.value)
    }

    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const firstPage = await client.get(`/api/v1/posts/${storyId}/comments`).query({ limit: 2 })

    expect(firstPage.status).toBe(200)
    expect(firstPage.body.comments).toHaveLength(2)
    expect(firstPage.body.nextCursor).not.toBeNull()

    const secondPage = await client.get(`/api/v1/posts/${storyId}/comments`).query({ limit: 2, cursor: firstPage.body.nextCursor })

    expect(secondPage.status).toBe(200)
    const allIds = [...firstPage.body.comments, ...secondPage.body.comments].map((row: { id: string }) => row.id)
    expect(allIds).toEqual(expect.arrayContaining(seededIds))
    expect(new Set(allIds).size).toBe(seededIds.length)
  })

  it('returns 404 when GET /api/v1/posts/{id}/comments targets an unknown post id', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/posts/00000000-0000-4000-8000-000000000099/comments').query({ limit: 10 })

    expect(response.status).toBe(200)
    expect(response.body.comments).toEqual([])
    expect(response.body.nextCursor).toBeNull()
  })

  it('returns search results shape from GET /api/v1/posts', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/posts').query({ order: 'asc', orderBy: 'visibility' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        posts: expect.any(Array),
        totalCount: expect.any(Number)
      })
    )
  })

  it('allows unauthenticated pass-through search', async () => {
    const response = await request(systemWiring.app).get('/api/v1/posts').query({ order: 'asc', orderBy: 'visibility' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        posts: expect.any(Array),
        totalCount: expect.any(Number)
      })
    )
  })

  it('returns only public posts for anonymous search with seeded data', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const publicTitle = `posts-public-${uuid().slice(0, 8)}`
    const privateTitle = `posts-private-${uuid().slice(0, 8)}`

    const { story: publicStory } = await seedStoryFixture(persistenceHarness, unitFixture, {
      createdById: creator.userId,
      visibility: VisibilityEnum.Public,
      title: publicTitle
    })
    const { story: privateStory } = await seedStoryFixture(persistenceHarness, unitFixture, {
      createdById: creator.userId,
      visibility: VisibilityEnum.Private,
      title: privateTitle
    })

    const response = await request(systemWiring.app).get('/api/v1/posts').query({ order: 'asc', orderBy: 'title' })

    expect(response.status).toBe(200)
    expect(response.body.posts.some((row: { id: string }) => row.id === publicStory.id.value)).toBe(true)
    expect(response.body.posts.some((row: { id: string }) => row.id === privateStory.id.value)).toBe(false)
    expect(response.body.posts.every((row: { visibility: string }) => row.visibility === VisibilityEnum.Public)).toBe(true)
  })

  it('allows authenticated search to include own private posts', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const privateTitle = `posts-own-private-${uuid().slice(0, 8)}`
    const { story: privateStory } = await seedStoryFixture(persistenceHarness, unitFixture, {
      createdById: creator.userId,
      visibility: VisibilityEnum.Private,
      title: privateTitle
    })
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/posts').query({ order: 'asc', orderBy: 'title' })

    expect(response.status).toBe(200)
    expect(response.body.posts.some((row: { id: string }) => row.id === privateStory.id.value)).toBe(true)
  })

  it('returns 403 when anonymous search filters by visibility=private', async () => {
    const response = await request(systemWiring.app)
      .get('/api/v1/posts')
      .query({ order: 'asc', orderBy: 'title', visibility: VisibilityEnum.Private })

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('returns 422 when GET /api/v1/posts has invalid query parameters', async () => {
    const response = await request(systemWiring.app).get('/api/v1/posts').query({ orderBy: 'not-a-valid-key' })
    expect(response.status).toBe(422)
  })

  it('creates a top-level comment via POST /api/v1/posts/:postId/comments', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: loginUser.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.post(`/api/v1/posts/${story.id.value}/comments`).send({ body: 'New comment body' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        body: 'New comment body',
        authorId: loginUser.userId,
        postId: story.id.value
      })
    )
  })

  it('returns 422 when POST has an empty comment body', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: loginUser.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.post(`/api/v1/posts/${story.id.value}/comments`).send({ body: '' })

    expect(response.status).toBe(422)
  })
})
