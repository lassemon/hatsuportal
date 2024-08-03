import { describe, expect, it, vi } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { MediaQueryFacade } from './MediaQueryFacade'
import { MediaQueryMapper } from './mappers/MediaQueryMapper'
import * as Fixture from '../../../__test__/testFactory'

describe('MediaQueryFacade', () => {
  const setup = () => {
    const imageLookupService = {
      findById: vi.fn(),
      findByIdAndVersionId: vi.fn()
    }
    const mediaQueryMapper = new MediaQueryMapper()
    const facade = new MediaQueryFacade(imageLookupService, mediaQueryMapper)
    return { imageLookupService, facade }
  }

  it('returns image contract when image exists', async () => {
    const { imageLookupService, facade } = setup()
    const image = Fixture.imageMock()
    imageLookupService.findById.mockResolvedValue(image)

    const result = await facade.getImageById({ imageId: Fixture.sampleImageId })

    expect(result.kind).toBe(mediaV1.MediaKindContract.Image)
    expect(result.id).toBe(Fixture.sampleImageId)
    expect(result.storageKey).toBe(Fixture.sampleImageStorageKey)
  })

  it('throws NotFoundError when image is missing', async () => {
    const { imageLookupService, facade } = setup()
    imageLookupService.findById.mockResolvedValue(null)

    await expect(facade.getImageById({ imageId: Fixture.sampleImageId })).rejects.toBeInstanceOf(NotFoundError)
  })
})
