import { describe, expect, it } from 'vitest'
import { OrderEnum, uuid, unixtimeNow } from '@hatsuportal/common'
import { CommentId, PostId } from '@hatsuportal/post-management'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import config from '../../../../config'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import {
  createCommentWriteRepository,
  seedCommentFixture,
  seedCommentWithRepliesFixture
} from '../../../support/fixtures/commentFixture'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('CommentController (system)', () => {
  it('returns replies ordered according to config.comment.defaultRepliesSortOrder', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const olderCreatedAt = 1_700_000_000
    const newerCreatedAt = 1_700_000_100
    const { parentComment, replies } = await seedCommentWithRepliesFixture(persistenceHarness, unitFixture, {
      authorId: loginUser.userId,
      createdById: loginUser.userId,
      replyCreatedAtValues: [newerCreatedAt, olderCreatedAt]
    })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get(`/api/v1/comments/${parentComment.id.value}/replies`)

    expect(response.status).toBe(200)
    expect(response.body.replies.map((reply: { id: string }) => reply.id)).toEqual(
      config.comment.defaultRepliesSortOrder === OrderEnum.Ascending
        ? [replies[1].id.value, replies[0].id.value]
        : [replies[0].id.value, replies[1].id.value]
    )
  })

  it('creates a top-level comment via POST /api/v1/comments/:postId/comment', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: loginUser.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.post(`/api/v1/comments/${story.id.value}/comment`).send({ body: 'New comment body' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        body: 'New comment body',
        authorId: loginUser.userId,
        postId: story.id.value
      })
    )
  })

  it('edits a comment via PATCH /api/v1/comments/:commentId as author', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture, {
      authorId: loginUser.userId,
      createdById: loginUser.userId
    })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.patch(`/api/v1/comments/${comment.id.value}`).send({ body: 'Edited body' })

    expect(response.status).toBe(200)
    expect(response.body.body).toBe('Edited body')
  })

  it('soft-deletes a comment via DELETE /api/v1/comments/:commentId as author', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture, {
      authorId: loginUser.userId,
      createdById: loginUser.userId
    })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.delete(`/api/v1/comments/${comment.id.value}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: comment.id.value,
        isDeleted: true
      })
    )
  })

  it.todo('returns 401 when creating a comment without auth (currently returns 500 via InvalidRequestError)')

  it.todo('returns 401 when editing a comment without auth (currently returns 500 via InvalidRequestError)')

  it.todo('returns 401 when deleting a comment without auth (currently returns 500 via InvalidRequestError)')

  it('returns 403 when editing a comment as a non-author viewer', async ({ unitFixture }) => {
    const userA = await seedLoginUser(persistenceHarness)
    const userB = await seedLoginUser(persistenceHarness)
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture, {
      authorId: userA.userId,
      createdById: userA.userId
    })
    const cookies = await loginAndGetCookies(systemWiring.app, userB)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.patch(`/api/v1/comments/${comment.id.value}`).send({ body: 'edited body' })

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('returns 403 when deleting a comment as a non-author viewer', async ({ unitFixture }) => {
    const userA = await seedLoginUser(persistenceHarness)
    const userB = await seedLoginUser(persistenceHarness)
    const { comment } = await seedCommentFixture(persistenceHarness, unitFixture, {
      authorId: userA.userId,
      createdById: userA.userId
    })
    const cookies = await loginAndGetCookies(systemWiring.app, userB)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.delete(`/api/v1/comments/${comment.id.value}`)

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('returns 404 when PATCH targets an unknown comment id', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client
      .patch('/api/v1/comments/00000000-0000-4000-8000-000000000099')
      .send({ body: 'Missing comment' })

    expect(response.status).toBe(404)
  })

  it('returns 404 when POST targets an unknown post id', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client
      .post('/api/v1/comments/00000000-0000-4000-8000-000000000099/comment')
      .send({ body: 'Orphan comment' })

    expect(response.status).toBe(404)
  })

  it('returns 422 when POST has an empty comment body', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: loginUser.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.post(`/api/v1/comments/${story.id.value}/comment`).send({ body: '' })

    expect(response.status).toBe(422)
  })

  it('paginates replies with nextCursor via GET /api/v1/comments/:commentId/replies', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { comment, storyId } = await seedCommentFixture(persistenceHarness, unitFixture, {
      authorId: loginUser.userId,
      createdById: loginUser.userId
    })
    const commentWriteRepository = createCommentWriteRepository(persistenceHarness)
    const baseCreatedAt = unixtimeNow() - 10_000
    const replyIds: string[] = []

    for (let index = 0; index < 3; index++) {
      const createdAt = baseCreatedAt + index * 1_000
      const reply = unitFixture.commentMock({
        id: new CommentId(uuid()),
        postId: new PostId(storyId),
        parentCommentId: comment.id,
        createdAt: new CreatedAtTimestamp(createdAt),
        updatedAt: new UnixTimestamp(createdAt)
      })
      await persistenceHarness.createUnitOfWork().execute(async () => {
        await commentWriteRepository.insert(reply)
        return [null]
      })
      replyIds.push(reply.id.value)
    }

    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const firstPage = await client.get(`/api/v1/comments/${comment.id.value}/replies`).query({ limit: 2 })

    expect(firstPage.status).toBe(200)
    expect(firstPage.body.replies).toHaveLength(2)
    expect(firstPage.body.nextCursor).not.toBeNull()

    const secondPage = await client
      .get(`/api/v1/comments/${comment.id.value}/replies`)
      .query({ limit: 2, cursor: firstPage.body.nextCursor })

    expect(secondPage.status).toBe(200)
    const allIds = [...firstPage.body.replies, ...secondPage.body.replies].map((row: { id: string }) => row.id)
    expect(allIds).toEqual(expect.arrayContaining(replyIds))
    expect(new Set(allIds).size).toBe(replyIds.length)
  })
})
