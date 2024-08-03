import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { systemWiring } from '../../../setup.system'

describe('authRequest (system)', () => {
  it('does not authenticate without cookies', async () => {
    const response = await request(systemWiring.app).get('/api/v1/secureping')

    expect(response.status).toBe(401)
  })
})
