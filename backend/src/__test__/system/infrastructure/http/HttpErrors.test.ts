import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { uuid } from '@hatsuportal/common'
import { systemWiring } from '../../../setup.system'

describe('HttpErrors (system)', () => {
  it('returns 404 for unknown image id', async () => {
    const response = await request(systemWiring.app).get(`/api/v1/images/${uuid()}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 404,
        name: 'NotFound'
      })
    )
  })

  it('returns 401 for GET /api/v1/users/ without auth', async () => {
    const response = await request(systemWiring.app).get('/api/v1/users/')

    expect(response.status).toBe(401)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 401,
        name: 'Unauthorized'
      })
    )
  })
})
