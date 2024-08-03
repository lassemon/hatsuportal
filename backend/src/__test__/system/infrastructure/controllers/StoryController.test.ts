import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { UserRoleEnum, VisibilityEnum, uuid } from '@hatsuportal/common'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { seedStoryFixture } from '../../../support/fixtures/storyFixture'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

const validCreateStoryBody = {
  title: 'New story',
  body: 'Story body',
  visibility: 'public',
  image: null,
  tags: [] as []
}

async function seedCreatorUser() {
  return seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Creator] })
}

describe('StoryController (system)', () => {
  it('returns my stories for the logged-in owner', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: loginUser.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/stories/my')

    expect(response.status).toBe(200)
    expect(response.body.stories.some((row: { id: string }) => row.id === story.id.value)).toBe(true)
  })

  it('creates a story via POST /api/v1/stories/ as owner', async () => {
    const creator = await seedCreatorUser()
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.post('/api/v1/stories/').send(validCreateStoryBody)

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        title: 'New Story',
        body: validCreateStoryBody.body,
        visibility: validCreateStoryBody.visibility,
        createdById: creator.userId
      })
    )
  })

  it('returns a story via GET /api/v1/stories/:storyId', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: creator.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get(`/api/v1/stories/${story.id.value}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(story.id.value)
  })

  it('updates a story via PATCH /api/v1/stories/:storyId as owner', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: creator.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.patch(`/api/v1/stories/${story.id.value}`).send({ title: 'Updated title' })

    expect(response.status).toBe(200)
    expect(response.body.title).toBe('Updated title')
  })

  it('deletes a story via DELETE /api/v1/stories/:storyId as owner', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: creator.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.delete(`/api/v1/stories/${story.id.value}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(story.id.value)
  })

  it('returns 401 for POST /api/v1/stories/ without auth', async () => {
    const response = await request(systemWiring.app).post('/api/v1/stories/').send(validCreateStoryBody)

    expect(response.status).toBe(401)
  })

  it('returns 401 for PATCH /api/v1/stories/:storyId without auth', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: creator.userId })

    const response = await request(systemWiring.app)
      .patch(`/api/v1/stories/${story.id.value}`)
      .send({ title: 'Blocked update' })

    expect(response.status).toBe(401)
  })

  it('returns 401 for DELETE /api/v1/stories/:storyId without auth', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: creator.userId })

    const response = await request(systemWiring.app).delete(`/api/v1/stories/${story.id.value}`)

    expect(response.status).toBe(401)
  })

  it('returns 401 for GET /api/v1/stories/my without auth', async () => {
    const response = await request(systemWiring.app).get('/api/v1/stories/my')

    expect(response.status).toBe(401)
  })

  it('returns 403 when patching a story as a non-owner viewer', async ({ unitFixture }) => {
    const userA = await seedCreatorUser()
    const userB = await seedCreatorUser()
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: userA.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, userB)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.patch(`/api/v1/stories/${story.id.value}`).send({ title: 'Blocked update' })

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('returns 403 when deleting a story as a non-owner viewer', async ({ unitFixture }) => {
    const userA = await seedCreatorUser()
    const userB = await seedCreatorUser()
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, { createdById: userA.userId })
    const cookies = await loginAndGetCookies(systemWiring.app, userB)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.delete(`/api/v1/stories/${story.id.value}`)

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('returns 403 when viewing a private story as a non-owner', async ({ unitFixture }) => {
    const owner = await seedCreatorUser()
    const viewer = await seedLoginUser(persistenceHarness)
    const { story } = await seedStoryFixture(persistenceHarness, unitFixture, {
      createdById: owner.userId,
      visibility: VisibilityEnum.Private,
      title: 'Private story'
    })
    const cookies = await loginAndGetCookies(systemWiring.app, viewer)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get(`/api/v1/stories/${story.id.value}`)

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('returns 404 when GET targets an unknown story id', async () => {
    const response = await request(systemWiring.app).get('/api/v1/stories/00000000-0000-4000-8000-000000000099')

    expect(response.status).toBe(404)
  })

  it('returns 404 when PATCH targets an unknown story id', async () => {
    const creator = await seedCreatorUser()
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client
      .patch('/api/v1/stories/00000000-0000-4000-8000-000000000099')
      .send({ title: 'Missing story' })

    expect(response.status).toBe(404)
  })

  it('returns 422 when POST /api/v1/stories/ has invalid body', async () => {
    const creator = await seedCreatorUser()
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.post('/api/v1/stories/').send({
      ...validCreateStoryBody,
      title: ''
    })

    expect(response.status).toBe(422)
  })

  it.todo('returns 409 when PATCH /api/v1/stories/:storyId hits a concurrency conflict')

  it('returns only public stories for anonymous search', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const publicTitle = `public-${uuid().slice(0, 8)}`
    const privateTitle = `private-${uuid().slice(0, 8)}`
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

    const response = await request(systemWiring.app).get('/api/v1/stories').query({ order: 'asc', orderBy: 'title' })

    expect(response.status).toBe(200)
    expect(response.body.stories.some((row: { id: string }) => row.id === publicStory.id.value)).toBe(true)
    expect(response.body.stories.some((row: { id: string }) => row.id === privateStory.id.value)).toBe(false)
    expect(response.body.stories.every((row: { visibility: string }) => row.visibility === VisibilityEnum.Public)).toBe(true)
  })

  it('allows authenticated search to include own private stories', async ({ unitFixture }) => {
    const creator = await seedCreatorUser()
    const privateTitle = `own-private-${uuid().slice(0, 8)}`
    const { story: privateStory } = await seedStoryFixture(persistenceHarness, unitFixture, {
      createdById: creator.userId,
      visibility: VisibilityEnum.Private,
      title: privateTitle
    })
    const cookies = await loginAndGetCookies(systemWiring.app, creator)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/stories').query({ order: 'asc', orderBy: 'title' })

    expect(response.status).toBe(200)
    expect(response.body.stories.some((row: { id: string }) => row.id === privateStory.id.value)).toBe(true)
  })

  it('returns 403 when anonymous search filters by visibility', async () => {
    const response = await request(systemWiring.app)
      .get('/api/v1/stories')
      .query({ order: 'asc', orderBy: 'title', visibility: VisibilityEnum.Public })

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })
})
