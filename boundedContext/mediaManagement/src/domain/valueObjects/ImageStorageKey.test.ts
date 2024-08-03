import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { MimeType } from './MimeType'
import { ImageStorageKey } from './ImageStorageKey'
import * as Fixture from '../../__test__/testFactory'

describe('ImageStorageKey', () => {
  it('constructs a current storage key', () => {
    const key = new ImageStorageKey(
      EntityTypeEnum.Story,
      ImageRoleEnum.Cover,
      'owner-entity-id',
      'version-id',
      Fixture.sampleUserId,
      new MimeType('image/png'),
      false
    )

    expect(key.staged).toBe(false)
    expect(key.value).toBe(`story_cover_owner-entity-id_version-id_${Fixture.sampleUserId}.png`)
  })

  it('constructs a staged storage key', () => {
    const key = new ImageStorageKey(
      EntityTypeEnum.Story,
      ImageRoleEnum.Cover,
      Fixture.sampleImageId,
      Fixture.sampleImageVersionId,
      Fixture.sampleUserId,
      new MimeType('image/png'),
      true
    )

    expect(key.staged).toBe(true)
    expect(key.value).toBe(Fixture.sampleStagedImageStorageKeyWithVersionId)
  })

  it('parses a storage key from string', () => {
    const parsed = ImageStorageKey.fromString(Fixture.sampleImageStorageKey)

    expect(parsed.entityType).toBe(EntityTypeEnum.Story)
    expect(parsed.role).toBe(ImageRoleEnum.Cover)
    expect(parsed.ownerEntityId).toBe(Fixture.sampleImageId)
    expect(parsed.versionId).toBe('version-id')
    expect(parsed.createdById).toBe(Fixture.sampleUserId)
    expect(parsed.staged).toBe(false)
    expect(parsed.value).toBe(Fixture.sampleImageStorageKey)
  })

  it('parses a staged storage key from string', () => {
    const parsed = ImageStorageKey.fromString(Fixture.sampleStagedImageStorageKeyWithVersionId)

    expect(parsed.staged).toBe(true)
    expect(parsed.value).toBe(Fixture.sampleStagedImageStorageKeyWithVersionId)
  })

  it('compares storage keys by value', () => {
    const left = ImageStorageKey.fromString(Fixture.sampleImageStorageKey)
    const right = ImageStorageKey.fromString(Fixture.sampleImageStorageKey)

    expect(left.equals(right)).toBe(true)
    expect(left.equals(Fixture.sampleImageStorageKey)).toBe(false)
  })

  it('parses jpeg storage keys with canonical image/jpeg mime type', () => {
    const constructed = new ImageStorageKey(
      EntityTypeEnum.Story,
      ImageRoleEnum.Cover,
      Fixture.sampleImageId,
      Fixture.sampleImageVersionId,
      Fixture.sampleUserId,
      new MimeType('image/jpeg'),
      false
    )

    const parsed = ImageStorageKey.fromString(constructed.value)

    expect(constructed.value).toContain('.jpg')
    expect(parsed.mimeType.value).toBe('image/jpeg')
    expect(parsed.mimeType.equals(new MimeType('image/jpeg'))).toBe(true)
  })
})
