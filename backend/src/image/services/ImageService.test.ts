import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImageService } from './ImageService'

describe('ImageService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('converts Base64 image to a buffer', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)

    expect(imageService.convertBase64ImageToBuffer('data:image/png;base64,test')).toBeInstanceOf(Buffer)
    expect(() => imageService.convertBase64ImageToBuffer('')).toThrow('Invalid base64 image data')
    expect(() => imageService.convertBase64ImageToBuffer('asd')).toThrow('Invalid base64 image data')
    expect(() => imageService.convertBase64ImageToBuffer('data:image/png;base66')).toThrow('Invalid base64 image data')
  })

  it('converts a buffer to Base64 image', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    const buffer = imageService.convertBase64ImageToBuffer('data:image/png;base64,test')
    const base64 = imageService.convertBufferToBase64Image(buffer, unitFixture.imageMetadata())
    expect(base64).toBe('data:image/png;base64,test')
  })

  it('parses image file name', ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    expect(imageService.parseImageFilename(unitFixture.imageMetadata())).toBe('item_0_filename.png')
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

    await imageService.validateMimeType(unitFixture.base64ImageBuffer(), unitFixture.imageMetadata())
    expect(spy).toBeCalledTimes(1)
  })

  it.fails('fails to validate mime type', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    await expect(imageService.validateMimeType(unitFixture.base64ImageBuffer(), unitFixture.imageMetadata())).rejects.toBe(1)
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
    imageService.writeImageToFileSystem(unitFixture.base64ImageBuffer(), unitFixture.imageMetadata())
    expect(spy).toBeCalledTimes(1)
  })

  it('calls image storage service to get file from file system', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageStorageServiceMock, 'getImageFromFileSystem').mockResolvedValue('image/png')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    await imageService.getImageFromFileSystem('filename.png')
    expect(spy).toBeCalledTimes(1)
  })

  it('calls image storage service to delete file from file system', async ({ unitFixture }) => {
    const imageProcessingServiceMock = unitFixture.imageProcessingServiceMock()
    const imageStorageServiceMock = unitFixture.imageStorageServiceMock()
    const spy = vi.spyOn(imageStorageServiceMock, 'deleteImageFromFileSystem').mockResolvedValue('image/png')

    const imageService = new ImageService(imageProcessingServiceMock, imageStorageServiceMock)
    await imageService.deleteImageFromFileSystem('filename.png')
    expect(spy).toBeCalledTimes(1)
  })
})
