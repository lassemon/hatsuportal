import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { UserRoleEnum, uuid } from '@hatsuportal/common'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('UserController (system)', () => {
  it('returns 401 for GET /api/v1/users/ without auth', async () => {
    const response = await request(systemWiring.app).get('/api/v1/users/')

    expect(response.status).toBe(401)
  })

  it('returns the authenticated user from GET /api/v1/users/me', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/users/me')

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(loginUser.userId)
  })

  it('returns the deactivated session user for self from GET /api/v1/users/me', async () => {
    const targetUser = await seedLoginUser(persistenceHarness)
    const targetCookies = await loginAndGetCookies(systemWiring.app, targetUser)

    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminCookies = await loginAndGetCookies(systemWiring.app, adminUser)
    const adminClient = createAuthenticatedClient(systemWiring.app, adminCookies.cookieHeader)

    const deactivateResponse = await adminClient.delete(`/api/v1/users/${targetUser.userId}`)
    expect(deactivateResponse.status).toBe(200)

    const targetClient = createAuthenticatedClient(systemWiring.app, targetCookies.cookieHeader)
    const response = await targetClient.get('/api/v1/users/me')

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(targetUser.userId)
  })

  it('returns 404 when admin deactivates an already-inactive user', async () => {
    const targetUser = await seedLoginUser(persistenceHarness)
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminCookies = await loginAndGetCookies(systemWiring.app, adminUser)
    const adminClient = createAuthenticatedClient(systemWiring.app, adminCookies.cookieHeader)

    const firstDelete = await adminClient.delete(`/api/v1/users/${targetUser.userId}`)
    expect(firstDelete.status).toBe(200)

    const secondDelete = await adminClient.delete(`/api/v1/users/${targetUser.userId}`)
    expect(secondDelete.status).toBe(404)
  })

  it('returns 200 when patching active true on an already-active user', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.patch(`/api/v1/users/${loginUser.userId}`).send({ active: true })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(loginUser.userId)
  })

  it('returns 403 when user A requests user B profile by id', async () => {
    const userA = await seedLoginUser(persistenceHarness)
    const userB = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, userA)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get(`/api/v1/users/${userB.userId}`)

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('returns 403 for GET /api/v1/users/ as a non-admin viewer', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/users/')

    expect(response.status).toBe(403)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 403,
        name: 'Forbidden'
      })
    )
  })

  it('allows admin to create a user via POST /api/v1/users/', async () => {
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader)

    const response = await adminClient.post('/api/v1/users/').send({
      name: `created-${uuid().slice(0, 8)}`,
      email: `created-${uuid().slice(0, 8)}@hatsuportal.test`,
      password: 'ValidPassword123',
      roles: [UserRoleEnum.Viewer]
    })

    expect(response.status).toBe(200)
    expect(response.body.email).toContain('@hatsuportal.test')
  })

  it('returns 403 when viewer creates a user via POST /api/v1/users/', async () => {
    const viewer = await seedLoginUser(persistenceHarness)
    const client = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, viewer)).cookieHeader)

    const response = await client.post('/api/v1/users/').send({
      name: 'blocked-create',
      email: `blocked-${uuid().slice(0, 8)}@hatsuportal.test`,
      password: 'ValidPassword123',
      roles: [UserRoleEnum.Viewer]
    })

    expect(response.status).toBe(403)
  })

  it.todo('returns 409 Conflict when POST /api/v1/users/ uses duplicate email')

  it('returns 422 when POST /api/v1/users/ has invalid body', async () => {
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader)

    const response = await adminClient.post('/api/v1/users/').send({
      name: `invalid-${uuid().slice(0, 8)}`,
      email: `invalid-${uuid().slice(0, 8)}@hatsuportal.test`,
      password: 'short',
      roles: [UserRoleEnum.Viewer]
    })

    expect(response.status).toBe(422)
  })

  it('allows self-update via PATCH /api/v1/users/:id', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const client = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, loginUser)).cookieHeader)

    const response = await client.patch(`/api/v1/users/${loginUser.userId}`).send({ name: 'Updated Self Name' })

    expect(response.status).toBe(200)
    expect(response.body.name).toBe('Updated Self Name')
  })

  it('allows admin to update another user via PATCH /api/v1/users/:id', async () => {
    const target = await seedLoginUser(persistenceHarness)
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader)

    const response = await adminClient.patch(`/api/v1/users/${target.userId}`).send({ name: 'Admin Updated Name' })

    expect(response.status).toBe(200)
    expect(response.body.name).toBe('Admin Updated Name')
  })

  it('returns 403 when viewer updates another user via PATCH /api/v1/users/:id', async () => {
    const target = await seedLoginUser(persistenceHarness)
    const viewer = await seedLoginUser(persistenceHarness)
    const client = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, viewer)).cookieHeader)

    const response = await client.patch(`/api/v1/users/${target.userId}`).send({ name: 'Blocked Update' })

    expect(response.status).toBe(403)
  })

  it('returns 400 when PATCH password change uses wrong oldPassword', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const client = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, loginUser)).cookieHeader)

    const response = await client.patch(`/api/v1/users/${loginUser.userId}`).send({
      newPassword: 'NewValidPassword123',
      oldPassword: 'WrongPassword123'
    })

    expect(response.status).toBe(400)
  })

  it('returns 404 when PATCH targets an inactive user', async () => {
    const target = await seedLoginUser(persistenceHarness)
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader)

    expect((await adminClient.delete(`/api/v1/users/${target.userId}`)).status).toBe(200)

    const response = await adminClient.patch(`/api/v1/users/${target.userId}`).send({ name: 'Should Fail' })

    expect(response.status).toBe(404)
  })

  it('allows admin to deactivate a user via DELETE /api/v1/users/:id', async () => {
    const target = await seedLoginUser(persistenceHarness)
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader)

    const response = await adminClient.delete(`/api/v1/users/${target.userId}`)

    expect(response.status).toBe(200)
  })

  it('returns 403 when viewer deactivates a user via DELETE /api/v1/users/:id', async () => {
    const target = await seedLoginUser(persistenceHarness)
    const viewer = await seedLoginUser(persistenceHarness)
    const client = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, viewer)).cookieHeader)

    const response = await client.delete(`/api/v1/users/${target.userId}`)

    expect(response.status).toBe(403)
  })

  it('returns 404 when DELETE targets unknown user id', async () => {
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader)

    const response = await adminClient.delete('/api/v1/users/00000000-0000-4000-8000-000000000099')

    expect(response.status).toBe(404)
  })

  it('returns 200 for GET /api/v1/users/ as admin', async () => {
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(systemWiring.app, (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader)

    const response = await adminClient.get('/api/v1/users/')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.some((user: { id: string }) => user.id === adminUser.userId)).toBe(true)
  })
})
