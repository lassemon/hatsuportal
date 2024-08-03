import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageService } from './ImageService'
import { Base64Image, FileName, InvalidBase64ImageError, MimeType } from '@hatsuportal/domain'

describe('ImageService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('converts Base64 image to a buffer', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)

    expect(imageService.convertBase64ImageToBuffer(new Base64Image('data:image/png;base64,test'))).toBeInstanceOf(Buffer)
    expect(() => imageService.convertBase64ImageToBuffer(new Base64Image(''))).toThrow(InvalidBase64ImageError)
    expect(() => imageService.convertBase64ImageToBuffer(new Base64Image('asd'))).toThrow(InvalidBase64ImageError)
    expect(() => imageService.convertBase64ImageToBuffer(new Base64Image('data:image/png;base66'))).toThrow(InvalidBase64ImageError)
  })

  it('converts a buffer to Base64 image', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    const buffer = imageService.convertBase64ImageToBuffer(new Base64Image('data:image/png;base64,test'))
    const base64 = imageService.convertBufferToBase64Image(buffer, new MimeType(unitFixture.imageMetadata().mimeType))
    expect(base64).toBe('data:image/png;base64,test')
  })

  it('uses image processing service to resize image buffer', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageProcessingServiceMock, 'resizeImage')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    await imageService.resizeImageBuffer(unitFixture.base64ImageBuffer())
    expect(spy).toBeCalledTimes(1)
  })

  it('uses image processing service to validate mime type', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageProcessingServiceMock, 'getBufferMimeType').mockResolvedValue('image/png')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)

    await imageService.validateMimeType(unitFixture.base64ImageBuffer(), new FileName(unitFixture.imageMetadata().fileName))
    expect(spy).toBeCalledTimes(1)
  })

  it.fails('fails to validate mime type', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    await expect(
      imageService.validateMimeType(unitFixture.base64ImageBuffer(), new FileName(unitFixture.imageMetadata().fileName))
    ).rejects.toBe(1)
  })

  it('calls image processing service to get buffer mime type', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageProcessingServiceMock, 'getBufferMimeType').mockResolvedValue('image/png')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    imageService.getBufferMimeType(unitFixture.base64ImageBuffer())
    expect(spy).toBeCalledTimes(1)
  })

  it('calls image storage service to write file to file system', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageStorageServiceMock, 'writeImageBufferToFile')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    imageService.writeImageToFileSystem(unitFixture.base64ImageBuffer(), new FileName(unitFixture.imageMetadata().fileName))
    expect(spy).toBeCalledTimes(1)
  })

  it('calls image storage service to get file from file system', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageStorageServiceMock, 'getImageFromFileSystem').mockResolvedValue('image/png')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    await imageService.getImageFromFileSystem(new FileName('filename.png'))
    expect(spy).toBeCalledTimes(1)
  })

  it('calls image storage service to delete file from file system', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageStorageServiceMock, 'deleteImageFromFileSystem').mockResolvedValue('image/png')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    await imageService.deleteImageFromFileSystem(new FileName('filename.png'))
    expect(spy).toBeCalledTimes(1)
  })
})
