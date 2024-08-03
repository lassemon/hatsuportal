import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('PingController (system)', () => {
  it('returns pong from GET /api/v1/ping without auth', async () => {
    const response = await request(systemWiring.app).get('/api/v1/ping')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ping: 'pong' })
  })

  it('returns 401 from secureping without auth and 200 after login', async () => {
    const unauthenticated = await request(systemWiring.app).get('/api/v1/secureping')
    expect(unauthenticated.status).toBe(401)

    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const authenticated = await client.get('/api/v1/secureping')
    expect(authenticated.status).toBe(200)
    expect(authenticated.body).toEqual({ securePing: 'pong' })
  })

  it('returns pong from apikeyping with valid API key and rejects invalid key', async () => {
    const valid = await request(systemWiring.app).get('/api/v1/apikeyping').query({ api_key: 'test-api-key' })
    expect(valid.status).toBe(200)
    expect(valid.body).toEqual({ apiKeyPing: 'pong' })

    const invalid = await request(systemWiring.app).get('/api/v1/apikeyping').query({ api_key: 'wrong-key' })
    expect(invalid.status).toBe(401)
  })
})
