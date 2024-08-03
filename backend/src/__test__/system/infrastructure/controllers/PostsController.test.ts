import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { UserRoleEnum, VisibilityEnum, uuid } from '@hatsuportal/common'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

async function seedCreatorUser() {
  return seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Creator] })
}

describe('PostsController (system)', () => {
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
})
