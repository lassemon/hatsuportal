import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { FileSystemImageStorageService } from '../../../../infrastructure/services/FileSystemImageStorageService'
import config from '../../../../config'
import { seedImageFixture } from '../../../support/fixtures/imageFixture'
import { seedLoginUser } from '../../../support/fixtures/userFixture'
import { persistenceHarness } from '../../../setup.db'
import { systemWiring } from '../../../setup.system'

describe('ImageController (system)', () => {
  it('returns strict ImageWithRelationsResponse for GET /api/v1/images/{id}', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const imageStorageService = new FileSystemImageStorageService(config.images.basePath)
    const { imageId } = await seedImageFixture(persistenceHarness, unitFixture, {
      createdById: loginUser.userId,
      imageStorageService
    })

    const response = await request(systemWiring.app).get(`/api/v1/images/${imageId}`)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual({
      id: imageId,
      createdById: loginUser.userId,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
      mimeType: 'image/png',
      size: 100,
      base64: expect.any(String),
      createdByName: loginUser.username
    })
  })

  it('returns 404 for valid-length unknown image id', async () => {
    const unknownImageId = '00000000-0000-4000-8000-000000000099'

    const response = await request(systemWiring.app).get(`/api/v1/images/${unknownImageId}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 404,
        name: 'NotFound'
      })
    )
  })

  it('returns 422 for image id that fails ImageId validation', async () => {
    const response = await request(systemWiring.app).get('/api/v1/images/bad-id')

    expect(response.status).toBe(422)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 422,
        name: 'UnprocessableContent'
      })
    )
  })

  it('returns 404 when metadata exists but storage file is missing', async ({ unitFixture }) => {
    const loginUser = await seedLoginUser(persistenceHarness)
    const { imageId } = await seedImageFixture(persistenceHarness, unitFixture, {
      createdById: loginUser.userId
    })

    const response = await request(systemWiring.app).get(`/api/v1/images/${imageId}`)

    expect(response.status).toBe(404)
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 404,
        name: 'NotFound'
      })
    )
  })
})
