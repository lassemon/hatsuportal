import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { StagedImage } from '../../domain'
import { StorageKeyGenerator } from '../../infrastructure'
import { StagedImageFactory } from './StagedImageFactory'
import * as Fixture from '../../__test__/testFactory'

describe('StagedImageFactory', () => {
  const factory = new StagedImageFactory(new StorageKeyGenerator())

  it('createFromInput builds a staged image with generated ids and staged storage key', () => {
    const staged = factory.createFromInput(Fixture.sampleUserId, {
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: Fixture.sampleImageId,
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 256,
      base64: Fixture.sampleBase64DataUrl
    })

    expect(staged).toBeInstanceOf(StagedImage)
    expect(staged.imageId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
    expect(staged.id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
    expect(staged.id.value).not.toBe(staged.imageId.value)
    expect(staged.storageKey.staged).toBe(true)
    expect(staged.storageKey.value).toContain('staged_')
    expect(staged.storageKey.value).toContain(Fixture.sampleImageId)
    expect(staged.mimeType.value).toBe('image/png')
    expect(staged.size.value).toBe(256)
    expect(staged.createdById.value).toBe(Fixture.sampleUserId)
    expect(staged.isStaged).toBe(true)
  })

  it('fromPreparedDTO builds external-storage staged image from prepared metadata', () => {
    const staged = factory.fromPreparedDTO({
      imageId: Fixture.sampleImageId,
      stagedVersionId: Fixture.sampleImageVersionId,
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId,
      mimeType: 'image/png',
      size: 100,
      createdById: Fixture.sampleUserId
    })

    expect(staged.imageId.value).toBe(Fixture.sampleImageId)
    expect(staged.id.value).toBe(Fixture.sampleImageVersionId)
    expect(staged.storageKey.value).toBe(Fixture.sampleStagedImageStorageKeyWithVersionId)
    expect(staged.base64.isExternalStorageReference()).toBe(true)
  })
})
