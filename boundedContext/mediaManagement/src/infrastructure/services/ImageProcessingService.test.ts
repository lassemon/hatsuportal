import { describe, expect, it } from 'vitest'
import { ImageProcessingService } from './ImageProcessingService'
import { Jimp } from 'jimp'

describe('ImageProcessingService', () => {
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
})
