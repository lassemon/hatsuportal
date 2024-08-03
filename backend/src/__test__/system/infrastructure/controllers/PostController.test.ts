import { describe, expect, it } from 'vitest'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { CommentAuthorId, CommentId, PostId } from '@hatsuportal/post-management'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { createCommentWriteRepository, seedCommentFixture } from '../../../support/fixtures/commentFixture'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('PostController (system)', () => {
  it('returns top-level comments shape from GET /api/v1/post/{id}/comments', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { comment, storyId } = await seedCommentFixture(persistenceHarness, unitFixture, {
      authorId: loginUser.userId,
      createdById: loginUser.userId
    })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get(`/api/v1/post/${storyId}/comments`).query({ limit: 10 })

    expect(response.status).toBe(200)
    expect(response.body.comments.some((row: { id: string }) => row.id === comment.id.value)).toBe(true)
    expect(response.body).toEqual(
      expect.objectContaining({
        comments: expect.any(Array),
        nextCursor: null
      })
    )
  })

  it('paginates top-level comments with nextCursor via GET /api/v1/post/{id}/comments', async ({ unitFixture }) => {
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

    const firstPage = await client.get(`/api/v1/post/${storyId}/comments`).query({ limit: 2 })

    expect(firstPage.status).toBe(200)
    expect(firstPage.body.comments).toHaveLength(2)
    expect(firstPage.body.nextCursor).not.toBeNull()

    const secondPage = await client
      .get(`/api/v1/post/${storyId}/comments`)
      .query({ limit: 2, cursor: firstPage.body.nextCursor })

    expect(secondPage.status).toBe(200)
    const allIds = [...firstPage.body.comments, ...secondPage.body.comments].map((row: { id: string }) => row.id)
    expect(allIds).toEqual(expect.arrayContaining(seededIds))
    expect(new Set(allIds).size).toBe(seededIds.length)
  })

  it('returns 404 when GET /api/v1/post/{id}/comments targets an unknown post id', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/post/00000000-0000-4000-8000-000000000099/comments').query({ limit: 10 })

    expect(response.status).toBe(200)
    expect(response.body.comments).toEqual([])
    expect(response.body.nextCursor).toBeNull()
  })
})
