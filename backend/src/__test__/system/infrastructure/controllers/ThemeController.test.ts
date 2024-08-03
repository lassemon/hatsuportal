import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { UserRoleEnum } from '@hatsuportal/common'
import { DefaultThemeId } from '@hatsuportal/user-management'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('ThemeController (system)', () => {
  it('returns 401 for GET /api/v1/themes/ without auth', async () => {
    const response = await request(systemWiring.app).get('/api/v1/themes/')
    expect(response.status).toBe(401)
  })

  it('allows authenticated user to list themes', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/themes/')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.some((theme: { id: string }) => theme.id === new DefaultThemeId().value)).toBe(true)
  })

  it('returns 403 when non-admin creates a theme', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.post('/api/v1/themes/').send({
      name: 'Viewer Theme',
      lightColors: {
        primary: '#111111',
        backgroundPrimary: '#222222',
        backgroundSecondary: '#333333',
        callToAction: '#444444'
      },
      darkColors: {
        primary: '#555555',
        backgroundPrimary: '#666666',
        backgroundSecondary: '#777777',
        callToAction: '#888888'
      }
    })

    expect(response.status).toBe(403)
  })

  it('allows admin CRUD for custom themes and blocks default delete', async () => {
    const adminUser = await seedLoginUser(persistenceHarness, { roles: [UserRoleEnum.Admin] })
    const adminCookies = await loginAndGetCookies(systemWiring.app, adminUser)
    const adminClient = createAuthenticatedClient(systemWiring.app, adminCookies.cookieHeader)

    const createResponse = await adminClient.post('/api/v1/themes/').send({
      name: 'Admin Theme',
      lightColors: {
        primary: '#111111',
        backgroundPrimary: '#222222',
        backgroundSecondary: '#333333',
        callToAction: '#444444'
      },
      darkColors: {
        primary: '#555555',
        backgroundPrimary: '#666666',
        backgroundSecondary: '#777777',
        callToAction: '#888888'
      }
    })

    expect(createResponse.status).toBe(201)
    const themeId = createResponse.body.id

    const patchResponse = await adminClient.patch(`/api/v1/themes/${themeId}`).send({ name: 'Renamed Theme' })
    expect(patchResponse.status).toBe(200)
    expect(patchResponse.body.name).toBe('Renamed Theme')

    const deleteUnusedResponse = await adminClient.delete(`/api/v1/themes/${themeId}`)
    expect(deleteUnusedResponse.status).toBe(204)

    const deleteDefaultResponse = await adminClient.delete(`/api/v1/themes/${new DefaultThemeId().value}`)
    expect(deleteDefaultResponse.status).toBe(409)
  })
})
