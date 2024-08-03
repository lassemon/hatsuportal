import { afterEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { UserRoleEnum } from '@hatsuportal/common'
import { loginAndGetCookies, parseSetCookieHeaders } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('AuthController (system)', () => {
  afterEach(async () => {
    await request(systemWiring.app).post('/api/v1/auth/logout')
  })

  it('logs in and returns auth cookies', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)

    const response = await request(systemWiring.app).post('/api/v1/auth/login').send({
      username: loginUser.username,
      password: loginUser.password
    })

    expect(response.status).toBe(200)
    expect(response.body.name).toBe(loginUser.username)
    const cookies = parseSetCookieHeaders(response.headers['set-cookie'])
    expect(cookies.token).toBeTruthy()
    expect(cookies.refreshToken).toBeTruthy()
  })

  it('returns 401 for status without cookie and 200 after login', async () => {
    const unauthenticated = await request(systemWiring.app).get('/api/v1/auth/status')
    expect(unauthenticated.status).toBe(401)

    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const authenticated = await client.get('/api/v1/auth/status')
    expect(authenticated.status).toBe(200)
    expect(authenticated.body.name).toBe(loginUser.username)
  })

  it('refreshes auth token with a valid refresh cookie', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)

    const refreshResponse = await request(systemWiring.app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies.cookieHeader)

    expect(refreshResponse.status).toBe(200)
    expect(refreshResponse.headers['set-cookie']?.[0]).toContain('token=')
  })

  it('returns 401 for refresh with an invalid refresh cookie', async () => {
    const response = await request(systemWiring.app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', 'refreshToken=invalid-token')

    expect(response.status).toBe(401)
  })

  it('returns 401 for wrong password login', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)

    const response = await request(systemWiring.app).post('/api/v1/auth/login').send({
      username: loginUser.username,
      password: 'WrongPassword123'
    })

    expect(response.status).toBe(401)
  })

  it('returns 401 for inactive user login', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminClient = createAuthenticatedClient(
      systemWiring.app,
      (await loginAndGetCookies(systemWiring.app, adminUser)).cookieHeader
    )

    expect((await adminClient.delete(`/api/v1/users/${loginUser.userId}`)).status).toBe(200)

    const response = await request(systemWiring.app).post('/api/v1/auth/login').send({
      username: loginUser.username,
      password: loginUser.password
    })

    expect(response.status).toBe(401)
  })

  it('returns 422 for malformed login body missing password', async () => {
    const response = await request(systemWiring.app).post('/api/v1/auth/login').send({
      username: 'alice'
    })

    expect(response.status).toBe(422)
  })

  it('logs out and clears refresh token usage', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)

    const logoutResponse = await request(systemWiring.app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookies.cookieHeader)

    expect(logoutResponse.status).toBe(200)

    const refreshResponse = await request(systemWiring.app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies.cookieHeader)

    expect(refreshResponse.status).toBe(401)
  })
})
