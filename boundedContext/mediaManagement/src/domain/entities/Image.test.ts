import { describe, expect, it } from 'vitest'
import Image from './Image'
import _ from 'lodash'
import { ImageId } from '../valueObjects/ImageId'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ImageCreatorId } from '../valueObjects/ImageCreatorId'
import { ImageVersionId } from '../valueObjects/ImageVersionId'
import { MimeType } from '../valueObjects/MimeType'
import { Base64Image } from '../valueObjects/Base64Image'
import { uuid } from '@hatsuportal/common'

describe('Image', () => {
  it('can create image with all properties', ({ unitFixture }) => {
    const image = Image.create({
      id: new ImageId(unitFixture.imageDTOMock().id),
      createdAt: new UnixTimestamp(unitFixture.imageDTOMock().createdAt),
      createdById: new ImageCreatorId(unitFixture.imageDTOMock().createdById),
      currentVersionId: new ImageVersionId(unitFixture.imageDTOMock().currentVersionId),
      updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt),
      versions: [unitFixture.imageVersionMock()]
    })
    expect(image).to.be.instanceOf(Image)
    expect(image.id.value).to.eq(unitFixture.imageDTOMock().id)
    expect(image.createdAt.value).to.eq(unitFixture.imageDTOMock().createdAt)
    expect(image.createdById.value).to.eq(unitFixture.imageDTOMock().createdById)
    expect(image.currentVersionId?.value).to.eq(unitFixture.imageDTOMock().currentVersionId)
    expect(image.updatedAt.value).to.eq(unitFixture.imageVersionMock().createdAt.value) // images updatedAt is the latest version createdAt if version is set
    expect(image.versions.size).to.eq(1)

    const currentVersion = image.getCurrentVersionOrThrow()
    expect(currentVersion.id.value).to.eq(unitFixture.imageVersionMock().id.value)
    expect(currentVersion.imageId.value).to.eq(unitFixture.imageDTOMock().id)
    expect(currentVersion.mimeType.value).to.eq(unitFixture.imageDTOMock().mimeType)
    expect(currentVersion.size.value).to.eq(unitFixture.imageDTOMock().size)
    expect(currentVersion.base64.value).to.eq(unitFixture.imageDTOMock().base64)
    expect(currentVersion.storageKey.value).to.eq(unitFixture.imageDTOMock().storageKey)
    expect(currentVersion.isCurrent).to.be.true
    expect(currentVersion.isStaged).to.be.false
    expect(currentVersion.createdById.value).to.eq(unitFixture.imageDTOMock().createdById)
    expect(currentVersion.createdAt.value).to.eq(image.updatedAt.value)
  })

  it('sets file extension based on mime type', ({ unitFixture }) => {
    const image = Image.reconstruct({
      id: unitFixture.imageMock().id,
      createdAt: unitFixture.imageMock().createdAt,
      createdById: unitFixture.imageMock().createdById,
      currentVersionId: unitFixture.imageMock().currentVersionId,
      updatedAt: unitFixture.imageMock().updatedAt,
      versions: [
        unitFixture.imageVersionMock({
          mimeType: new MimeType('video/x-msvideo')
        })
      ]
    })
    expect(image.fileExtension).toBe('avi')
  })

  it('can compare images', ({ unitFixture }) => {
    const image = unitFixture.imageMock()
    const otherImageId = new ImageId(uuid())
    const otherImage = Image.create({
      id: otherImageId,
      createdAt: new UnixTimestamp(unitFixture.imageDTOMock().createdAt),
      createdById: new ImageCreatorId(unitFixture.imageDTOMock().createdById),
      currentVersionId: new ImageVersionId(unitFixture.imageDTOMock().currentVersionId),
      updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt),
      versions: [unitFixture.imageVersionMock({ imageId: otherImageId })]
    })
    expect(image.equals(image)).toBe(true)
    expect(image.equals(otherImage)).toBe(false)
  })

  it('creates image with proper base64 encoding prefix', ({ unitFixture }) => {
    const image = Image.create({
      id: new ImageId(unitFixture.imageDTOMock().id),
      createdAt: new UnixTimestamp(unitFixture.imageDTOMock().createdAt),
      createdById: new ImageCreatorId(unitFixture.imageDTOMock().createdById),
      currentVersionId: new ImageVersionId(unitFixture.imageDTOMock().currentVersionId),
      updatedAt: new UnixTimestamp(unitFixture.imageDTOMock().updatedAt),
      versions: [unitFixture.imageVersionMock({ base64: Base64Image.create('data:image/png;base64,testbinarystring') })]
    })
    expect(image.base64?.value).toBe('data:image/png;base64,testbinarystring')
  })
})
