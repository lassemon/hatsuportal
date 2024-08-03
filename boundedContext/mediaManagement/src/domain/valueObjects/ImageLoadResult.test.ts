import { describe, it, expect } from 'vitest'
import { ImageLoadResult } from './ImageLoadResult'
import { ImageLoadError } from '../entities/ImageLoadError'
import { Image, ImageProps, ImageVersionProps } from '../entities/Image'
import { ImageId } from './ImageId'
import { ImageVersionId } from './ImageVersionId'
import { ImageStorageKey } from './ImageStorageKey'
import { MimeType } from './MimeType'
import { FileSize } from './FileSize'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ImageCreatorId } from './ImageCreatorId'
import { Base64Image } from './Base64Image'

describe('ImageLoadResult', () => {
  const VALID_IMAGE_ID = '123e4567-e89b-12d3-a456-426614174000'
  const VALID_IMAGE_VERSION_ID = '123e4567-e89b-12d3-a456-426614174001'

  const buildValidImageVersionProps = (): ImageVersionProps => ({
    id: new ImageVersionId(VALID_IMAGE_VERSION_ID),
    storageKey: ImageStorageKey.fromString('test.png'),
    mimeType: new MimeType('image/png'),
    size: new FileSize(12345),
    imageId: new ImageId(VALID_IMAGE_ID),
    isCurrent: true,
    isStaged: false,
    createdById: new ImageCreatorId('111e2222-e33b-44d3-a456-426614174abc'),
    createdAt: new UnixTimestamp(1710000000),
    base64: Base64Image.create('data:image/png;base64,abcdefg')
  })

  const buildValidImageProps = (): ImageProps => ({
    id: new ImageId(VALID_IMAGE_ID),
    createdById: new ImageCreatorId('111e2222-e33b-44d3-a456-426614174abc'),
    currentVersionId: new ImageVersionId(VALID_IMAGE_VERSION_ID),
    versions: [buildValidImageVersionProps()],
    createdAt: new UnixTimestamp(1710000000),
    updatedAt: new UnixTimestamp(1710000001)
  })

  const buildValidImage = () => Image.reconstruct(buildValidImageProps())

  const buildLoadError = (message = 'Failed to load') => new ImageLoadError({ imageId: VALID_IMAGE_ID, error: new Error(message) })

  it('should create a success result and return the value', () => {
    const image = buildValidImage()
    const result = ImageLoadResult.success(image)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toBe(image)
    expect(() => result.error).toThrow()
  })

  it('should create a failed result and return the error', () => {
    const error = buildLoadError('Load failed')
    const result = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error.error)
    expect(result.isFailed()).toBe(true)
    expect(result.error).toBeInstanceOf(ImageLoadError)
    expect(result.error.error.message).toBe('Load failed')
    expect(() => result.value).toThrow()
  })

  it('should create a notSet result', () => {
    const result = ImageLoadResult.notSet()
    expect(result.isNotSet()).toBe(true)
    expect(result.isSuccess()).toBe(false)
    expect(result.isFailed()).toBe(false)
    expect(() => result.value).toThrow()
    expect(() => result.error).toThrow()
  })

  it('should match on success', () => {
    const image = buildValidImage()
    const result = ImageLoadResult.success(image)
    const matched = result.match(
      (v) => `success:${v.id.value}`,
      () => `fail`,
      () => 'notset'
    )
    expect(matched).toBe(`success:${image.id.value}`)
  })

  it('should match on failure', () => {
    const error = buildLoadError('fail!')
    const result = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error.error)
    const matched = result.match(
      (v) => `success:${(v as any).id?.value ?? ''}`,
      (e) => `fail:${e.error.message}`,
      () => 'notset'
    )
    expect(matched).toBe('fail:fail!')
  })

  it('should match on notSet', () => {
    const result = ImageLoadResult.notSet()
    const matched = result.match(
      (v) => `success:${v}`,
      (e) => `fail:${e}`,
      () => 'notset'
    )
    expect(matched).toBe('notset')
  })

  it('tap should call function on success', () => {
    const image = buildValidImage()
    const result = ImageLoadResult.success(image)
    let called = false
    result.tap((v) => {
      called = true
      expect(v).toBe(image)
    })
    expect(called).toBe(true)
  })

  it('tap should not call function on failure or notSet', () => {
    const error = buildLoadError()
    const failResult = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error.error)
    let called = false
    failResult.tap(() => {
      called = true
    })
    expect(called).toBe(false)

    const notSetResult = ImageLoadResult.notSet()
    called = false
    notSetResult.tap(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('tapError should call function on failure', () => {
    const error = buildLoadError('fail')
    const result = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error.error)
    let called = false
    result.tapError((e) => {
      called = true
      expect(e).toBeInstanceOf(ImageLoadError)
      expect(e.error.message).toBe('fail')
    })
    expect(called).toBe(true)
  })

  it('tapError should not call function on success or notSet', () => {
    const image = buildValidImage()
    const successResult = ImageLoadResult.success(image)
    let called = false
    successResult.tapError(() => {
      called = true
    })
    expect(called).toBe(false)

    const notSetResult = ImageLoadResult.notSet()
    called = false
    notSetResult.tapError(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('equals should return true for equal success results', () => {
    const image = buildValidImage()
    const a = ImageLoadResult.success(image)
    const b = ImageLoadResult.success(image)
    expect(a.equals(b)).toBe(true)
  })

  it('equals should return false for different success results', () => {
    const image = buildValidImage()
    const imageWithDifferentId = Image.reconstruct({
      ...buildValidImageProps(),
      id: new ImageId('different-id-98a976faödksjgf-akahsdk'),
      versions: [{ ...buildValidImageVersionProps(), imageId: new ImageId('different-id-98a976faödksjgf-akahsdk') }]
    })
    const a = ImageLoadResult.success(image)
    const b = ImageLoadResult.success(imageWithDifferentId)
    expect(a.equals(b)).toBe(false)
  })

  it('equals should return true for equal failed results', () => {
    const error1 = buildLoadError('fail')
    const error2 = buildLoadError('fail')
    const a = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error1.error)
    const b = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error2.error)
    expect(a.equals(b)).toBe(true)
  })

  it('equals should return false for different failed results', () => {
    const error1 = buildLoadError('fail1')
    const error2 = buildLoadError('fail2')
    const a = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error1.error)
    const b = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), error2.error)
    expect(a.equals(b)).toBe(false)
  })

  it('equals should return true for notSet results', () => {
    const a = ImageLoadResult.notSet()
    const b = ImageLoadResult.notSet()
    expect(a.equals(b)).toBe(true)
  })

  it('toString should return a string representation', () => {
    const image = buildValidImage()
    const success = ImageLoadResult.success(image)
    expect(success.toString()).toContain('Result')
    const fail = ImageLoadResult.failedToLoad(new ImageId(VALID_IMAGE_ID), new Error('fail'))
    expect(fail.toString()).toContain('Result')
    const notSet = ImageLoadResult.notSet()
    expect(notSet.toString()).toContain('Result')
  })
})
