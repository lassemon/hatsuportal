import { describe, expect, it } from 'vitest'
import {
  Base64Image,
  FileSize,
  ImageCreatorId,
  ImageId,
  ImageStorageKey,
  ImageVersionId,
  MimeType,
  StagedImage
} from '../../domain'
import { StagedStorageKeyMismatchError } from '../errors/StagedStorageKeyMismatchError'
import { InvalidBase64ImageError } from '../errors/InvalidBase64ImageError'
import * as Fixture from '../../__test__/testFactory'

describe('StagedImage', () => {
  it('creates from image ensuring staged version', () => {
    const staged = Fixture.stagedImageMock()

    expect(staged.isStaged).toBe(true)
    expect(staged.id.value).toBe(Fixture.sampleImageVersionId)
    expect(staged.storageKey.staged).toBe(true)
  })

  it('creates a new staged image from command', () => {
    const staged = StagedImage.createNewFrom({
      imageId: new ImageId(Fixture.sampleImageId),
      stagedVersionId: new ImageVersionId(Fixture.sampleImageVersionId),
      storageKey: ImageStorageKey.fromString(Fixture.sampleStagedImageStorageKeyWithVersionId),
      mimeType: new MimeType('image/png'),
      size: new FileSize(100),
      base64: Base64Image.create(Fixture.base64ImageStringMock()),
      createdById: new ImageCreatorId(Fixture.sampleUserId)
    })

    expect(staged.isStaged).toBe(true)
    expect(staged.imageId.value).toBe(Fixture.sampleImageId)
  })

  it('throws when storage key is not staged', () => {
    expect(() =>
      StagedImage.createNewFrom({
        imageId: new ImageId(Fixture.sampleImageId),
        stagedVersionId: new ImageVersionId(Fixture.sampleImageVersionId),
        storageKey: ImageStorageKey.fromString(Fixture.sampleImageStorageKey),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        base64: Base64Image.create(Fixture.base64ImageStringMock()),
        createdById: new ImageCreatorId(Fixture.sampleUserId)
      })
    ).toThrow(StagedStorageKeyMismatchError)
  })

  it('registers staged metadata from a prepared handle without inline base64', () => {
    const staged = StagedImage.fromPreparedMetadata({
      imageId: new ImageId(Fixture.sampleImageId),
      stagedVersionId: new ImageVersionId(Fixture.sampleImageVersionId),
      storageKey: ImageStorageKey.fromString(Fixture.sampleStagedImageStorageKeyWithVersionId),
      mimeType: new MimeType('image/png'),
      size: new FileSize(100),
      createdById: new ImageCreatorId(Fixture.sampleUserId)
    })

    expect(staged.isStaged).toBe(true)
    expect(staged.imageId.value).toBe(Fixture.sampleImageId)
    expect(staged.base64.isExternalStorageReference()).toBe(true)
    expect(() => staged.base64.bytes).toThrow(InvalidBase64ImageError)
  })

  it('throws when prepared metadata storage key is not staged', () => {
    expect(() =>
      StagedImage.fromPreparedMetadata({
        imageId: new ImageId(Fixture.sampleImageId),
        stagedVersionId: new ImageVersionId(Fixture.sampleImageVersionId),
        storageKey: ImageStorageKey.fromString(Fixture.sampleImageStorageKey),
        mimeType: new MimeType('image/png'),
        size: new FileSize(100),
        createdById: new ImageCreatorId(Fixture.sampleUserId)
      })
    ).toThrow(StagedStorageKeyMismatchError)
  })

  it('supports equality, serialization and domain version access', () => {
    const staged = Fixture.stagedImageMock()
    const same = Fixture.stagedImageMock()

    expect(staged.equals(same)).toBe(true)
    expect(staged.equals(Fixture.currentImageMock())).toBe(false)
    expect(staged.toDomainVersion().id.value).toBe(Fixture.sampleImageVersionId)
    expect(staged.serialize()).toMatchObject({
      id: Fixture.sampleImageVersionId,
      imageId: Fixture.sampleImageId,
      isStaged: true
    })
  })
})
