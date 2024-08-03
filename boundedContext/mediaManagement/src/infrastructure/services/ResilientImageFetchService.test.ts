import { describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { ImageId } from '../../domain'
import { ResilientImageFetchService } from './ResilientImageFetchService'
import * as Fixture from '../../__test__/testFactory'

describe('ResilientImageFetchService', () => {
  const setup = () => {
    const imageLookupService = {
      findById: vi.fn(),
      findByIdAndVersionId: vi.fn()
    }
    const service = new ResilientImageFetchService(imageLookupService)
    return { imageLookupService, service }
  }

  it('returns success when image exists', async () => {
    const { imageLookupService, service } = setup()
    const image = Fixture.imageMock()
    imageLookupService.findById.mockResolvedValue(image)

    const result = await service.loadImageSafely(new ImageId(Fixture.sampleImageId))

    expect(result.isSuccess()).toBe(true)
    expect(result.value.id.value).toBe(Fixture.sampleImageId)
  })

  it('returns failed result when image is missing', async () => {
    const { imageLookupService, service } = setup()
    imageLookupService.findById.mockResolvedValue(null)

    const result = await service.loadImageSafely(new ImageId(Fixture.sampleImageId))

    expect(result.isFailed()).toBe(true)
    expect(result.error.error).toBeInstanceOf(NotFoundError)
  })

  it('returns failed result when lookup throws', async () => {
    const { imageLookupService, service } = setup()
    imageLookupService.findById.mockRejectedValue(new Error('lookup failed'))

    const result = await service.loadImageSafely(new ImageId(Fixture.sampleImageId))

    expect(result.isFailed()).toBe(true)
    expect(result.error.error.message).toBe('lookup failed')
  })

  it('wraps non-Error throws when loading safely', async () => {
    const { imageLookupService, service } = setup()
    imageLookupService.findById.mockRejectedValue('not-an-error')

    const result = await service.loadImageSafely(new ImageId(Fixture.sampleImageId))

    expect(result.isFailed()).toBe(true)
    expect(result.error.error.message).toBe('Unknown error occurred')
  })

  it('loads multiple images safely', async () => {
    const { imageLookupService, service } = setup()
    imageLookupService.findById.mockResolvedValueOnce(Fixture.imageMock()).mockResolvedValueOnce(null)

    const results = await service.loadImagesSafely([
      new ImageId(Fixture.sampleImageId),
      new ImageId(Fixture.sampleNonAuthorUserId)
    ])

    expect(results.get(Fixture.sampleImageId)?.isSuccess()).toBe(true)
    expect(results.get(Fixture.sampleNonAuthorUserId)?.isFailed()).toBe(true)
  })
})
