import { describe, expect, it } from 'vitest'
import { ImageProcessingError } from '../../application/errors/ImageProcessingError'
import { ImageProcessingService } from './ImageProcessingService'
import { Jimp } from 'jimp'
import { suppressExpectedConsoleError } from '../../__test__/support/suppressExpectedConsoleError'

describe('ImageProcessingService', () => {
  suppressExpectedConsoleError()
  const imageProcessingService = new ImageProcessingService()

  it('resizes image buffer', async ({ unitFixture }) => {
    const resizedBuffer = await imageProcessingService.resizeImage(unitFixture.base64ImageBufferMock(), { width: 120 })
    const image = await Jimp.read(resizedBuffer)
    expect(image.bitmap.width).toBe(120)
  })

  it('gets image mime type from buffer', async ({ unitFixture }) => {
    const mimeType = await imageProcessingService.getBufferMimeType(unitFixture.base64ImageBufferMock())
    expect(mimeType).toBe('image/png')
  })

  it('wraps resize failures in ImageProcessingError', async () => {
    await expect(imageProcessingService.resizeImage(Buffer.from('not-an-image'), { width: 120 })).rejects.toBeInstanceOf(
      ImageProcessingError
    )
  })
})
