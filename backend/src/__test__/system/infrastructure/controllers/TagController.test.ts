import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { seedTagFixture } from '../../../support/fixtures/tagFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('TagController (system)', () => {
  it('returns seeded tags from GET /api/v1/tags/', async ({ unitFixture }) => {
    const { tag } = await seedTagFixture(persistenceHarness, unitFixture)

    const response = await request(systemWiring.app).get('/api/v1/tags/')

    expect(response.status).toBe(200)
    expect(response.body.totalCount).toBeGreaterThanOrEqual(1)
    expect(response.body.tags.some((row: { id: string }) => row.id === tag.id.value)).toBe(true)
  })
})
