import { describe, expect, it } from 'vitest'
import { loginAndGetCookies } from '../../../support/http/authRequest'
import { createAuthenticatedClient } from '../../../support/http/authenticatedAgent'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('UserController profile/preferences routes (system)', () => {
  it('returns the authenticated user profile from GET /api/v1/users/me/profile', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/users/me/profile')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        bio: expect.any(String),
        statusMessage: expect.any(String),
        profileImageId: null
      })
    )
  })

  it('returns the authenticated user preferences from GET /api/v1/users/me/preferences', async () => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const cookies = await loginAndGetCookies(systemWiring.app, loginUser)
    const client = createAuthenticatedClient(systemWiring.app, cookies.cookieHeader)

    const response = await client.get('/api/v1/users/me/preferences')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        colorScheme: expect.any(String),
        selectedThemeId: expect.any(String),
        notificationSettings: expect.objectContaining({
          emailNotifications: expect.any(Boolean),
          pushNotifications: expect.any(Boolean)
        })
      })
    )
  })
})
