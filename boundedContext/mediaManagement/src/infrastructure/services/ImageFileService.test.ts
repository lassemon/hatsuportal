import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageFileService } from './ImageFileService'
import { InvalidInputError } from '@hatsuportal/platform'
import { Base64Image, FileName, MimeType, InvalidBase64ImageError } from '../../domain'

describe('ImageService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('converts Base64 image to a buffer', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()

    const imageService = new ImageFileService(imageProcessingServiceMock)

    expect(imageService.convertBase64ImageToBuffer(Base64Image.create('data:image/png;base64,test'))).toBeInstanceOf(Buffer)
    expect(() => imageService.convertBase64ImageToBuffer(Base64Image.create(''))).toThrow(InvalidBase64ImageError)
    expect(() => imageService.convertBase64ImageToBuffer(Base64Image.create('asd'))).toThrow(InvalidBase64ImageError)
    expect(() => imageService.convertBase64ImageToBuffer(Base64Image.create('data:image/png;base66'))).toThrow(InvalidBase64ImageError)
  })

  it('converts a buffer to Base64 image', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()

    const imageService = new ImageFileService(imageProcessingServiceMock)
    const buffer = imageService.convertBase64ImageToBuffer(Base64Image.create('data:image/png;base64,test'))
    const base64 = imageService.convertBufferToBase64Image(buffer, new MimeType(unitFixture.imageDTOMock().mimeType))
    expect(base64).toBe('data:image/png;base64,test')
  })

  it('uses image processing service to resize image buffer', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const spy = vi.spyOn(imageProcessingServiceMock, 'resizeImage')

    const imageService = new ImageFileService(imageProcessingServiceMock)
    await imageService.resizeImageBuffer(unitFixture.base64ImageBufferMock(), 320)
    expect(spy).toBeCalledTimes(1)
  })

  it('uses image processing service to validate mime type', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const spy = vi.spyOn(imageProcessingServiceMock, 'getBufferMimeType').mockResolvedValue('image/png')

    const imageService = new ImageFileService(imageProcessingServiceMock)

    await imageService.validateMimeType(unitFixture.base64ImageBufferMock(), new FileName(unitFixture.imageDTOMock().storageKey))
    expect(spy).toBeCalledTimes(1)
  })

  it('fails to validate mime type', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()

    const imageService = new ImageFileService(imageProcessingServiceMock)
    await expect(
      imageService.validateMimeType(unitFixture.base64ImageBufferMock(), new FileName(unitFixture.imageDTOMock().storageKey))
    ).rejects.toThrow(InvalidInputError)
  })

  it('calls image processing service to get buffer mime type', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const spy = vi.spyOn(imageProcessingServiceMock, 'getBufferMimeType').mockResolvedValue('image/png')

    const imageService = new ImageFileService(imageProcessingServiceMock)
    imageService.getBufferMimeType(unitFixture.base64ImageBufferMock())
    expect(spy).toBeCalledTimes(1)
  })
})
