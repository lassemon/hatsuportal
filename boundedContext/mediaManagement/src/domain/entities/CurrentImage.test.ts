import { describe, expect, it } from 'vitest'
import { unixtimeNow } from '@hatsuportal/common'
import { CreatedAtTimestamp } from '@hatsuportal/shared-kernel'
import { Base64Image, CurrentImage, FileSize, ImageCreatorId, ImageId, ImageStorageKey, ImageVersionId, MimeType } from '../../domain'
import * as Fixture from '../../__test__/testFactory'

describe('CurrentImage', () => {
  it('creates from image ensuring current version', () => {
    const image = Fixture.imageMock()
    const current = CurrentImage.fromImageEnsuringCurrentVersion(image)

    expect(current.id.value).toBe(Fixture.sampleImageId)
    expect(current.storageKey.value).toBe(Fixture.sampleImageStorageKey)
  })

  it('creates a new current image from command', () => {
    const createdAt = new CreatedAtTimestamp(unixtimeNow())
    const current = CurrentImage.createNewFrom({
      imageId: new ImageId(Fixture.sampleImageId),
      versionId: new ImageVersionId(Fixture.sampleImageVersionId),
      storageKey: ImageStorageKey.fromString(Fixture.sampleImageStorageKey),
      mimeType: new MimeType('image/png'),
      size: new FileSize(100),
      base64: Base64Image.create(Fixture.base64ImageStringMock()),
      createdById: new ImageCreatorId(Fixture.sampleUserId),
      createdAt
    })

    expect(current.id.value).toBe(Fixture.sampleImageId)
    expect(current.currentVersionId.value).toBe(Fixture.sampleImageVersionId)
    expect(current.serialize()).toMatchObject({
      id: Fixture.sampleImageId,
      currentVersionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleImageStorageKey
    })
  })

  it('compares current images by id', () => {
    const left = Fixture.currentImageMock()
    const right = Fixture.currentImageMock()
    expect(left.equals(right)).toBe(true)
    expect(left.equals(Fixture.stagedImageMock())).toBe(false)
  })
})
